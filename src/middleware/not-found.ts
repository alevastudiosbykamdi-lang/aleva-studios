import type { RequestHandler } from "express";
import { ApiError } from "../utils/api-error.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, "NOT_FOUND", `Route ${req.method} ${req.path} was not found`));
};
