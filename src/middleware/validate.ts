import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/api-error.js";

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map(({ path, code, message }) => ({ path, code, message }));
      next(new ApiError(400, "VALIDATION_ERROR", "Request body is invalid", details));
      return;
    }
    resLocalsValidated(_res).body = result.data;
    next();
  };
}

function resLocalsValidated(res: Parameters<RequestHandler>[1]): Record<string, unknown> {
  if (typeof res.locals.validated !== "object" || res.locals.validated === null) {
    res.locals.validated = {};
  }
  return res.locals.validated as Record<string, unknown>;
}
