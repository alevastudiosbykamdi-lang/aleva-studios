import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import type { AppConfig } from "./config/env.js";
import type { Logger } from "pino";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { createErrorHandler } from "./middleware/error-handler.js";
import { createHealthRouter } from "./routes/health.js";
import type { checkSupabaseReadiness } from "./config/supabase.js";
import { ApiError } from "./utils/api-error.js";

export function createApp(
  config: AppConfig,
  logger: Logger,
  readinessCheck?: typeof checkSupabaseReadiness,
) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(requestIdMiddleware);
  app.use(pinoHttp({
    logger,
    customProps: (req) => ({ requestId: req.id }),
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, path: req.url?.split("?")[0] }),
      res: (res) => ({ statusCode: res.statusCode }),
      err: (error) => ({ type: error.name }),
    },
  }));
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new ApiError(403, "CORS_ORIGIN_DENIED", "Origin is not allowed"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    maxAge: 600,
  }));
  app.use(express.json({ limit: "1mb", strict: true }));
  app.use(express.urlencoded({ extended: false, limit: "16kb", parameterLimit: 100 }));

  const apiLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ success: false, error: { code: "RATE_LIMITED", message: "Too many requests; please try again later" } });
    },
  });
  app.use("/api", apiLimiter);
  app.use("/health", createHealthRouter(config, logger, readinessCheck));

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger, config.nodeEnv === "production"));
  return app;
}
