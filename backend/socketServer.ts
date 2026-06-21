import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import type {
  TypedSocket,
  QueuedPlayer,
  ClocksType,
  GameMode,
  PlayerColor,
  GamePlayer,
  Result,
} from "./utils/types.js";
import { gameManager } from "./Game/GameManager.js";
import MatchmakingQueue from "./Game/MatchMakingQueue.js";
import { getOneUser } from "./services/user.service.js";
import fastifyCookie from "@fastify/cookie";
import { roomManager } from "./Game/RoomManager.js";
import { botGameManager } from "./Game/BotGameManager.js";
import { GameRecord } from "./models/gameRecord.model.js";

function verifyToken(token: string, secret: string) {
  try {
    return { payload: jwt.verify(token, secret) as jwt.JwtPayload, err: null };
  } catch (err) {
    return { payload: null, err };
  }
}

export default function socketServer(io: Server) {
  const matchQueue = new MatchmakingQueue();

  function createAndStartGame(
    player1: QueuedPlayer,
    player2: QueuedPlayer,
    mode: GameMode,
  ) {
    const game = gameManager.createGame((clocks: ClocksType) => {
      io.to(game.id).emit("timerUpdate", clocks);

      if (game.phase === "ended" && game.result === "timeout") {
        const winner = game.getPlayerByColor(game.winner!)!;
        const loser = game.getPlayerByColor(game.winner === "w" ? "b" : "w")!;

        io.to(winner.socketId).emit("gameOver", {
          result: "timeout",
          winner: game.winner,
          message: "Opponent ran out of time. You win!",
        });

        io.to(loser.socketId).emit("gameOver", {
          result: "timeout",
          winner: game.winner,
          message: "You ran out of time. You lose!",
        });

        game.stopGame();
        gameManager.removeGame(game.id);
      }
    }, mode);

    game.addPlayer(player1);
    game.addPlayer(player2);

    io.sockets.sockets.get(player1.socketId)?.join(game.id);
    io.sockets.sockets.get(player2.socketId)?.join(game.id);

    const white = game.getPlayerByColor("w")!;
    const black = game.getPlayerByColor("b")!;

    io.sockets.sockets.get(player1.socketId)!.data.gameId = game.id;
    io.sockets.sockets.get(player2.socketId)!.data.gameId = game.id;

    io.to(white.socketId).emit("gameCreated", { gameId: game.id, color: "w" });
    io.to(black.socketId).emit("gameCreated", { gameId: game.id, color: "b" });

    for (const player of [player1, player2]) {
      const me = game.getPlayerByUserId(player.userId)!;
      const opp = game.getOpponent(player.userId)!;

      io.to(player.socketId).emit("gameJoined", {
        gameId: game.id,
        me,
        fen: game.getFen(),
        mode,
        opponent: {
          userId: opp.userId,
          username: opp.username,
          elo: opp.elo,
          color: opp.color,
        },
      });
    }

    io.to(game.id).emit("vsIntro", {
      white: { username: player1.username, elo: player1.elo },
      black: { username: player2.username, elo: player2.elo },
    });

    let count = 3;
    const countInterval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(countInterval);
        io.to(game.id).emit("gameStart");
        game.startTurnTimer();
      }
    }, 1000);

    console.log(
      `Game ${game.id} created: ${player1.username} vs ${player2.username}`,
    );
  }

  setInterval(() => {
    const matches = matchQueue.matchAll();
    for (const [p1, p2] of matches) {
      createAndStartGame(p1, p2, "ranked");
    }
  }, 5000);

  setInterval(() => roomManager.purgeExpired(), 60 * 1000);

  /* ================= SOCKET AUTH ================= */
  io.use(async (socket: TypedSocket, next) => {
    try {
      const { accessToken, refreshToken } = fastifyCookie.fastifyCookie.parse(
        socket.handshake.headers.cookie || "",
      );

      if (!accessToken || !refreshToken) return next(new Error("UNAUTHORIZED"));

      const { payload, err: atErr } = verifyToken(
        accessToken,
        process.env.JWT_ACCESS_SECRET!,
      );

      if (payload) {
        const user = await getOneUser(payload.id);
        socket.data.userId = user._id.toString();
        socket.data.username = user.username;
        socket.data.elo = user.elo;
        return next();
      }

      if (
        atErr instanceof jwt.JsonWebTokenError &&
        !(atErr instanceof jwt.TokenExpiredError)
      ) {
        return next(new Error("INVALID_TOKEN"));
      }

      const { payload: rtUser, err: rtErr } = verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      );

      if (rtUser) return next(new Error("AT_EXPIRED"));

      if (rtErr instanceof jwt.TokenExpiredError) {
        return next(new Error("UNAUTHORIZED"));
      }

      return next(new Error("UNAUTHORIZED"));
    } catch (err) {
      console.log(err);
      return next(new Error("UNAUTHORIZED"));
    }
  });

  /* ================= CONNECTION ================= */
  io.on("connection", (socket: TypedSocket) => {
    /* ========= MATCHMAKING ========= */
    socket.on("startGameRanked", () => {
      const activeGame = gameManager.getGameByUserId(socket.data.userId);
      if (activeGame) {
        socket.emit("inGame", {
          gameId: activeGame.id,
          mode: activeGame.mode,
          message: "You are in a running game. Joining it...",
        });
        return;
      }

      const inQueue = matchQueue.findByUserId(socket.data.userId);
      if (inQueue) {
        const existingSocketId = matchQueue.findBySocketId(socket.id);
        if (!existingSocketId) {
          socket.emit("error", {
            message: "Already searching from another device or in another mode",
          });
        }
        return;
      }

      const player: QueuedPlayer = {
        socketId: socket.id,
        userId: socket.data.userId,
        username: socket.data.username,
        elo: socket.data.elo,
        queuedAt: new Date(),
      };

      matchQueue.enqueue(player);
      console.log(
        `Player ${player.username} joined queue. Queue size: ${matchQueue.size()}`,
      );

      const opponent = matchQueue.findMatch(player);
      if (!opponent) return;

      matchQueue.remove(player.socketId);
      matchQueue.remove(opponent.socketId);
      createAndStartGame(player, opponent, "ranked");
    });

    /* ========= CREATE ROOM ========= */

    socket.on("createRoom", () => {
      const activeGame = gameManager.getGameByUserId(socket.data.userId);
      if (activeGame) {
        return socket.emit("inGame", {
          gameId: activeGame.id,
          mode: activeGame.mode,
          message: "You are already in a running game.",
        });
      }

      const code = roomManager.createRoom(socket.id, socket.data.userId);
      socket.emit("roomCreated", { roomCode: code });
      console.log(`Room created: ${code} by ${socket.data.username}`);
    });

    /* ========= JOIN ROOM ========= */

    socket.on("joinRoom", ({ roomCode }) => {
      const activeGame = gameManager.getGameByUserId(socket.data.userId);
      if (activeGame) {
        return socket.emit("inGame", {
          gameId: activeGame.id,
          mode: activeGame.mode,
          message: "You are already in a running game.",
        });
      }

      const room = roomManager.getRoom(roomCode.trim().toUpperCase());

      if (!room) {
        return socket.emit("roomError", {
          message: "Invalid or expired room code.",
        });
      }

      if (room.creatorUserId === socket.data.userId) {
        return socket.emit("roomError", {
          message: "You cannot join your own room.",
        });
      }

      const creatorSocket = io.sockets.sockets.get(room.creatorSocketId);
      if (!creatorSocket) {
        roomManager.removeByCode(roomCode);
        return socket.emit("roomError", {
          message: "Room creator disconnected. Ask them to create a new room.",
        });
      }

      roomManager.removeByCode(roomCode);

      const creator: QueuedPlayer = {
        socketId: room.creatorSocketId,
        userId: room.creatorUserId,
        username: creatorSocket.data.username,
        elo: creatorSocket.data.elo,
        queuedAt: new Date(),
      };

      const joiner: QueuedPlayer = {
        socketId: socket.id,
        userId: socket.data.userId,
        username: socket.data.username,
        elo: socket.data.elo,
        queuedAt: new Date(),
      };

      createAndStartGame(creator, joiner, "friend");
    });

    /* ========= MOVE HANDLING ========= */
    socket.on("cancelRoom", () => {
      roomManager.removeByUserId(socket.data.userId);
      console.log(`Room cancelled by ${socket.data.username}`);
    });

    /* ========= MOVE HANDLING ========= */
    socket.on("makeMove", async ({ gameId, from, to, promotion }) => {
      const game = gameManager.getGame(gameId);
      if (!game) return socket.emit("error", { message: "Game not found" });

      const res = game.applyMove({
        identity: socket.id,
        from,
        to,
        promotion,
      });

      if (!res.ok) return socket.emit("moveError", { message: res.message! });

      if (res.promotionRequired) {
        return socket.emit("promotionRequest", {
          ok: true,
          promotionRequired: true,
          from: res.from,
          to: res.to,
        });
      }

      io.to(game.id).emit("moveMade", res);

      if (res.status === "ended") {
        const isDraw = !res.winner;

        if (isDraw) {
          io.to(game.id).emit("gameOver", {
            result: res.result,
            winner: null,
            message: `Game drawn by ${res.result?.replace("_", " ")}!`,
          });
        } else {
          const winner = game.getPlayerByColor(res.winner!)!;
          const loser = game.getPlayerByColor(res.winner === "w" ? "b" : "w")!;

          io.to(winner.socketId).emit("gameOver", {
            result: res.result,
            winner: res.winner,
            message: `${res.result === "checkmate" ? "Checkmate!" : "Game over!"} You win!`,
          });

          io.to(loser.socketId).emit("gameOver", {
            result: res.result,
            winner: res.winner,
            message: `${res.result === "checkmate" ? "Checkmate!" : "Game over!"} You lose!`,
          });
        }

        await game.endGame(res.result!);
        game.stopGame();
        gameManager.removeGame(game.id);
      } else {
        game.startTurnTimer();
      }
    });

    /* ========= RESIGN ========= */
    socket.on("resign", async (gameId) => {
      const game = gameManager.getGame(gameId);
      if (!game) return;

      const player = game.getPlayerByUserId(socket.data.userId);
      if (!player) return;

      const opponent = game.getOpponent(socket.data.userId);
      const winnerColor = player.color === "w" ? "b" : "w";

      io.to(player.socketId).emit("gameOver", {
        result: "resignation",
        winner: winnerColor,
        message: "You resigned. Better luck next time!",
      });

      if (opponent) {
        io.to(opponent.socketId).emit("gameOver", {
          result: "resignation",
          winner: winnerColor,
          message: "Opponent resigned. You win!",
        });
      }

      await game.endGame("resignation", winnerColor);
      game.stopGame();
      gameManager.removeGame(gameId);
    });

    /* ========= RESTORE ========= */
    socket.on("restoreGame", async (gameId) => {
      const activeGame = gameManager.getGameByUserId(socket.data.userId);

      if (activeGame) {
        if (activeGame.id !== gameId)
          return socket.emit("error", { message: "Match not found" });
        if (activeGame.status === "ended")
          return socket.emit("error", { message: "Game already ended" });

        const player = activeGame.getPlayerByUserId(socket.data.userId)!;
        const opponent = activeGame.getOpponent(socket.data.userId)!;

        // Kick old socket if different device
        if (player.socketId !== socket.id) {
          const oldSocket = io.sockets.sockets.get(player.socketId);
          if (oldSocket) {
            oldSocket.emit("kicked", {
              message: "You joined from another device.",
            });
            oldSocket.disconnect(true);
          }
        }

        activeGame.updateSocketId(socket.data.userId, socket.id);
        socket.join(activeGame.id);

        io.to(opponent.socketId).emit("opponent:disconnected", {
          message: "Opponent rejoined",
        });

        socket.emit("gameRejoined", {
          gameId: activeGame.id,
          me: player,
          fen: activeGame.getFen(),
          clocks: activeGame.getClocks(),
          turn: activeGame.getTurn(),
          opponent: {
            socketId: opponent.socketId,
            userId: opponent.userId,
            username: opponent.username,
            elo: opponent.elo,
            color: opponent.color,
          },
        });
      } else {
        socket.emit("error", {
          message: "Game ended already. Check your history",
        });
      }
    });

    /* ========= BOT GAME ========= */
    socket.on("startBotGame", async ({ level, color }) => {
      // Check if already in a multiplayer game
      const activeGame = gameManager.getGameByUserId(socket.data.userId);
      if (activeGame) {
        return socket.emit("inGame", {
          gameId: activeGame.id,
          mode: activeGame.mode,
          message: "You are already in a running game.",
        });
      }

      // Check for existing in-progress bot game
      const existingBotGame = botGameManager.getGameByUserId(
        socket.data.userId,
      );
      if (existingBotGame) {
        return socket.emit("botGameResume", {
          gameId: existingBotGame.id,
          fen: existingBotGame.getFen(),
          moves: existingBotGame.moves,
          turn: existingBotGame.getTurn(),
          level: existingBotGame.level,
          hintsRemaining: existingBotGame.getHintsRemaining(),
          color: existingBotGame.playerColor,
        });
      }

      // Check for in-progress bot game in DB
      const savedGame = await GameRecord.findOne({
        $or: [
          { whitePlayer: socket.data.userId },
          { blackPlayer: socket.data.userId },
        ],
        mode: "bot",
        status: "in_progress",
      }).sort({ updatedAt: -1 });

      if (savedGame) {
        // Restore game into memory
        const playerColor: PlayerColor =
          savedGame.whitePlayer?.toString() === socket.data.userId ? "w" : "b";

        const player: GamePlayer = {
          socketId: socket.id,
          userId: socket.data.userId,
          username: socket.data.username,
          elo: socket.data.elo,
          color: playerColor,
        };

        const game = botGameManager.createGame(
          player,
          savedGame.botLevel!,
          playerColor,
        );

        // Restore state
        for (const move of savedGame.moves) {
          const moveObj: { from: string; to: string; promotion?: string } = {
            from: move.from,
            to: move.to,
          };
          if (move.promotion) moveObj.promotion = move.promotion;
          game.chess.move(moveObj);
        }
        game.moves = savedGame.moves as any;
        game.history = savedGame.history ?? [];
        game.hintsUsed = savedGame.hintsUsed ?? 0;
        game.hintsAllowed = savedGame.hintsAllowed ?? 3;
        game.startedAt = savedGame.startedAt;

        return socket.emit("botGameResume", {
          gameId: game.id,
          fen: game.getFen(),
          moves: game.moves,
          turn: game.getTurn(),
          level: game.level,
          hintsRemaining: game.getHintsRemaining(),
          color: playerColor,
        });
      }

      // Create fresh bot game — randomly assign color
      const playerColor: PlayerColor =
        color === "random" ? (Math.random() < 0.5 ? "w" : "b") : color;

      const player: GamePlayer = {
        socketId: socket.id,
        userId: socket.data.userId,
        username: socket.data.username,
        elo: socket.data.elo,
        color: playerColor,
      };

      const game = botGameManager.createGame(player, level, playerColor);

      socket.emit("botGameCreated", {
        gameId: game.id,
        color: playerColor,
        level,
        hintsRemaining: game.getHintsRemaining(),
      });

      // If player is black, bot moves first
      if (playerColor === "b") {
        const botRes = await game.getBotMove();
        if (botRes.ok) {
          socket.emit("botMove", botRes as any);
          await game.save("in_progress");
        }
      }
    });

    /* ========= BOT MAKE MOVE ========= */
    socket.on("botMakeMove", async ({ gameId, from, to, promotion }) => {
      const game = botGameManager.getGame(gameId);
      if (!game) return socket.emit("error", { message: "Game not found" });

      if (game.player.userId !== socket.data.userId) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      // Apply player move
      const res = game.applyMove({ from, to, promotion });
      if (!res.ok) {
        return socket.emit("moveError", { message: res.message! });
      }

      if (res.promotionRequired) {
        return socket.emit("promotionRequest", {
          ok: true,
          promotionRequired: true,
          from: res.from!,
          to: res.to!,
        });
      }

      // Emit player move
      socket.emit("botMoveMade", res as any);

      // Check if game ended after player move
      if (res.status === "ended") {
        const playerWon = res.winner === game.playerColor;
        await game.save("completed", true);

        // Check level unlock
        const botGameOverPayload: {
          result: Result;
          winner: PlayerColor | null;
          message: string;
          levelUnlocked?: number;
        } = {
          result: res.result!,
          winner: res.winner,
          message: playerWon ? "You win! 🎉" : "It's a draw!",
        };

        if (playerWon) {
          botGameOverPayload.levelUnlocked = game.level + 1;
        }

        socket.emit("botGameOver", botGameOverPayload);

        botGameManager.removeGame(gameId);
        return;
      }

      // Save state after player move
      await game.save("in_progress");

      // Bot responds
      const botRes = await game.getBotMove();
      if (!botRes.ok) {
        return socket.emit("error", { message: botRes.message ?? "Bot error" });
      }

      socket.emit("botMove", botRes as any);

      // Check if game ended after bot move
      if (botRes.status === "ended") {
        await game.save("in_progress"); // keep alive for undo
        // botGameOver NOT emitted here — frontend shows undo/retry overlay

        socket.emit("botGameStalled", {
          result: botRes.result!,
          winner: botRes.winner!, // null for draws
          fen: botRes.fen!,
          move: botRes.move!,
          moves: botRes.moves!,
        });
        return;
      }
      // if (botRes.status === "ended") {
      //   await game.save("completed");

      //   socket.emit("botGameOver", {
      //     result: botRes.result!,
      //     winner: botRes.winner!,
      //     message:
      //       botRes.winner === game.botColor
      //         ? "Bot wins! Better luck next time."
      //         : "It's a draw!",
      //   });

      //   botGameManager.removeGame(gameId);
      //   return;
      // }

      // Save state after bot move
      await game.save("in_progress");
    });

    /* ========= REQUEST HINT ========= */
    socket.on("requestHint", async ({ gameId }) => {
      const game = botGameManager.getGame(gameId);
      if (!game) return socket.emit("error", { message: "Game not found" });

      if (game.player.userId !== socket.data.userId) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      const hint = await game.getHint();

      if (!hint.ok) {
        return socket.emit("hintDenied", {
          reason: hint.reason ?? "ad_required",
        });
      }

      socket.emit("hintResponse", {
        from: hint.from!,
        to: hint.to!,
        hintsRemaining: hint.hintsRemaining!,
      });
    });

    /* ========= GRANT AD HINT ========= */

    socket.on("grantAdHint", async ({ gameId, adToken }) => {
      const game = botGameManager.getGame(gameId);
      if (!game) return socket.emit("error", { message: "Game not found" });

      if (game.player.userId !== socket.data.userId) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      // TODO: Validate adToken with your ad provider
      // For now, we grant the hint (you'll add real validation)
      if (game.isBotThinking)
        return socket.emit("hintDenied", {
          reason: "already_processing",
        });
      game.useAdHint();

      // Optionally auto-request the hint after granting
      const hint = await game.getHint();
      if (hint.ok) {
        socket.emit("hintResponse", {
          from: hint.from!,
          to: hint.to!,
          hintsRemaining: hint.hintsRemaining!,
        });
      }
    });

    /* ========= UNDO MOVE ========= */
    socket.on("undoMove", async ({ gameId }) => {
      const game = botGameManager.getGame(gameId);
      if (!game) return socket.emit("error", { message: "Game not found" });

      const res = game.undoMove();
      if (!res.ok) {
        return socket.emit("error", {
          message: res.message ?? "Nothing to undo",
        });
      }

      socket.emit("undoConfirmed", {
        fen: res.fen!,
        moves: res.moves!,
        turn: res.turn!,
      });

      await game.save("in_progress");
    });

    /* ========= RESTART BOT GAME ========= */
    socket.on("restartBotGame", async ({ gameId }) => {
      const game = botGameManager.getGame(gameId);
      if (!game) return socket.emit("error", { message: "Game not found" });

      if (game.phase === "ended") {
        await game.save("completed");
      } else await game.save("abandoned"); // Save old game as abandoned

      game.restart();

      socket.emit("botGameCreated", {
        gameId: game.id,
        color: game.playerColor,
        level: game.level,
        hintsRemaining: game.getHintsRemaining(),
      });

      // If player is black, bot moves first after restart
      if (game.playerColor === "b") {
        const botRes = await game.getBotMove();
        if (botRes.ok) {
          socket.emit("botMove", botRes as any);
          await game.save("in_progress");
        }
      }
    });

    /* ========= CONTINUE BOT GAME ========= */
    socket.on("continueBotGame", ({ gameId }) => {
      const game = botGameManager.getGame(gameId);
      if (!game) return socket.emit("error", { message: "Game not found" });

      socket.emit("botGameResume", {
        gameId: game.id,
        fen: game.getFen(),
        moves: game.moves,
        turn: game.getTurn(),
        level: game.level,
        hintsRemaining: game.getHintsRemaining(),
        color: game.playerColor,
      });
    });

    /* ========= DISCONNECT ========= */
    socket.on("disconnect", async () => {
      console.log("disconnected", socket.data.userId);
      matchQueue.removeByUserId(socket.data.userId);

      // Save bot game state on disconnect
      const activeBotGame = botGameManager.getGameByUserId(socket.data.userId);
      if (activeBotGame && activeBotGame.phase !== "ended") {
        await activeBotGame.save("in_progress");
      } else if (activeBotGame && activeBotGame.phase === "ended") {
        await activeBotGame.save("completed");
        botGameManager.removeGame(activeBotGame.id);
      }

      const activeGame = gameManager.getGameByUserId(socket.data.userId);
      if (!activeGame) return;
      if (activeGame.status === "ended") return;

      // Friend mode — end immediately
      const opponent = activeGame.getOpponent(socket.data.userId);
      if (activeGame.mode === "friend") {
        const player = activeGame.getPlayerByUserId(socket.data.userId);
        const winnerColor = opponent?.color;

        io.to(opponent!.socketId).emit("gameOver", {
          result: "abandonment",
          winner: winnerColor,
          message: "Opponent disconnected. You win!",
        });

        activeGame.endGame("abandonment", winnerColor);
        activeGame.stopGame();
        gameManager.removeGame(activeGame.id);
        return;
      }

      io.to(opponent!.socketId).emit("opponent:disconnected", {
        message: "Opponent disconnected, waiting for them to rejoin...",
      });

      setTimeout(async () => {
        const game = gameManager.getGameByUserId(socket.data.userId);
        if (!game) return;

        const player = game.getPlayerByUserId(socket.data.userId);
        const opponent = game.getOpponent(socket.data.userId);

        if (player?.socketId === socket.id) {
          const winnerColor = opponent?.color;

          io.to(opponent!.socketId).emit("gameOver", {
            result: "abandonment",
            winner: winnerColor,
            message: "Opponent abandoned the game. You win!",
          });

          await game.endGame("abandonment");
          game.stopGame();
          gameManager.removeGame(game.id);
        }
      }, 30000);
    });
  });
}
