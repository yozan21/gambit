import type { FastifyReply, FastifyRequest, FastifyError } from "fastify";

type ValidationError = FastifyError & {
  validation?: any[];
};

export default function (
  error: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const err = error as ValidationError;
  const isDev = process.env.NODE_ENV === "development";

  // ✅ Handle schema validation errors
  if (err.validation) {
    const formattedErrors = err.validation.map((e) => ({
      field: e.instancePath.split("/").filter(Boolean).join("."),
      message: e.message,
    }));

    return reply.status(400).send({
      success: false,
      errors: formattedErrors,

      // 🔍 Dev-only extras
      ...(isDev && {
        error: err.validation,
        stack: err.stack,
      }),
    });
  }

  const statusCode = err.statusCode || 500;

  // ✅ Generic errors
  return reply.status(statusCode).send({
    success: false,
    message: err.message || "Internal Server Error",

    // 🔍 Dev-only extras
    ...(isDev && {
      error: err,
      stack: err.stack,
    }),
  });
}
