// types/fastify-jwt.d.ts
import "fastify";
import "@fastify/jwt";
import type { JwtPayload } from "./utils/types.ts";
declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
      role?: string;
      tokenVersion?: number;
    };
  }
}

declare module "fastify" {
  interface FastifyRequest {
    // Tell TypeScript these dynamic methods exist on the request object
    accessJwtVerify(): Promise<JwtPayload>;
    refreshJwtVerify(): Promise<JwtPayload>;
  }

  interface FastifyInstance {
    // Optional: Add these if you use fastify.jwt.accessSign in your code
    accessSign(payload: JwtPayload, options?: any): string;
    refreshSign(payload: JwtPayload, options?: any): string;
  }
}
