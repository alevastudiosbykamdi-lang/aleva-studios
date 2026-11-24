import pino from "pino";
import type { AppConfig } from "./env.js";

export function createLogger(config: Pick<AppConfig, "logLevel" | "nodeEnv">) {
  return pino({
    level: config.logLevel,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers.x-api-key",
        "res.headers.set-cookie",
        "*.supabaseServiceRoleKey",
        "*.SUPABASE_SERVICE_ROLE_KEY",
      ],
      censor: "[REDACTED]",
    },
    ...(config.nodeEnv === "development"
      ? { transport: { target: "pino-pretty", options: { colorize: true, singleLine: true } } }
      : {}),
  });
}
