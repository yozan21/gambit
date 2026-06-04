import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GameRecord } from "../models/gameRecord.model.js";
import sendResponse from "../utils/apiResponse.js";

// controllers/gameController.ts
export async function getMatchHistory(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = req.user.id;
  const page = Number((req.query as any).page) || 1;
  const limit = 10;

  const [games, total] = await Promise.all([
    GameRecord.find({ $or: [{ whitePlayer: userId }, { blackPlayer: userId }] })
      .sort({ endedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("whitePlayer blackPlayer", "username elo")
      .select("-moves -history -finalFen"),
    GameRecord.countDocuments({
      $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
    }),
  ]);

  sendResponse(reply, {
    statusCode: 200,
    message: "Matches fetch successful",
    data: {
      games,
      totalPages: Math.ceil(total / limit),
    },
  });
}
