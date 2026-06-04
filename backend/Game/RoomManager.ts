interface Room {
  code: string;
  creatorSocketId: string;
  creatorUserId: string;
  expiresAt: number;
}

const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const CODE_LENGTH = 6;

export class RoomManager {
  private rooms = new Map<string, Room>();

  private generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  createRoom(creatorSocketId: string, creatorUserId: string): string {
    // Remove any existing room by this user
    this.removeByUserId(creatorUserId);

    let code = this.generateCode();
    while (this.rooms.has(code)) {
      code = this.generateCode();
    }

    this.rooms.set(code, {
      code,
      creatorSocketId,
      creatorUserId,
      expiresAt: Date.now() + EXPIRY_MS,
    });

    return code;
  }

  getRoom(code: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    if (Date.now() > room.expiresAt) {
      this.rooms.delete(code);
      return null;
    }

    return room;
  }

  removeByCode(code: string) {
    this.rooms.delete(code);
  }

  removeByUserId(userId: string) {
    for (const [code, room] of this.rooms) {
      if (room.creatorUserId === userId) {
        this.rooms.delete(code);
        break;
      }
    }
  }

  // Clean up expired rooms periodically
  purgeExpired() {
    const now = Date.now();
    for (const [code, room] of this.rooms) {
      if (now > room.expiresAt) this.rooms.delete(code);
    }
  }
}

export const roomManager = new RoomManager();
