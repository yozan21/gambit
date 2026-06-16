// types/fastify-jwt.d.ts
import "fastify";
import "@fastify/jwt";
import type { JwtPayload } from "./utils/types.ts";
import "@fastify/oauth2";
import type { OAuth2Namespace } from "@fastify/oauth2";

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
    accessJwtVerify(): Promise<JwtPayload>;
    refreshJwtVerify(): Promise<JwtPayload>;
  }

  interface FastifyInstance {
    accessSign(payload: JwtPayload, options?: any): string;
    refreshSign(payload: JwtPayload, options?: any): string;
    googleOAuth2: OAuth2Namespace;
    accessJwt: {
      sign(payload: object, options?: any): string;
      verify(token: string): any;
    };
    refreshJwt: {
      sign(payload: object, options?: any): string;
      verify(token: string): any;
    };
  }
}
