import type { ErrorRequestHandler } from "express";
import type { Logger } from "pino";
import { ApiError } from "../utils/api-error.js";

export function createErrorHandler(logger: Logger, production: boolean): ErrorRequestHandler {
  return (error: unknown, req, res, _next) => {
    const apiError = error instanceof ApiError ? error : undefined;
    const errorType = typeof error === "object" && error !== null && "type" in error
      ? String(error.type)
      : undefined;
    const parserError = errorType === "entity.parse.failed" || errorType === "entity.too.large";
    const statusCode = apiError?.statusCode ?? (errorType === "entity.parse.failed" ? 400 : errorType === "entity.too.large" ? 413 : 500);
    const code = apiError?.code ?? (errorType === "entity.parse.failed"
      ? "INVALID_JSON"
      : errorType === "entity.too.large"
        ? "PAYLOAD_TOO_LARGE"
        : "INTERNAL_SERVER_ERROR");
    const message = apiError?.message ?? (errorType === "entity.parse.failed"
      ? "Request body contains invalid JSON"
      : errorType === "entity.too.large"
        ? "Request body exceeds the allowed size"
        : "An unexpected error occurred");

    if (statusCode >= 500) {
      logger.error({ errorType: error instanceof Error ? error.name : "UnknownError", requestId: req.id, method: req.method, path: req.path }, "Request failed");
    } else {
      logger.warn({ requestId: req.id, statusCode, code, method: req.method, path: req.path }, "Request rejected");
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(apiError?.details === undefined ? {} : { details: apiError.details }),
        requestId: req.id,
        ...(!production && error instanceof Error && !apiError && !parserError ? { debugMessage: error.message } : {}),
      },
    });
  };
}
