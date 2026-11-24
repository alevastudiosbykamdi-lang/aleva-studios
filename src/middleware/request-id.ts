import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const safeRequestId = /^[a-zA-Z0-9._-]{1,100}$/;

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-request-id");
  req.id = incoming && safeRequestId.test(incoming) ? incoming : randomUUID();
  res.setHeader("x-request-id", req.id);
  next();
};
