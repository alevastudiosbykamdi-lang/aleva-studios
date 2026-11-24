import { z } from "zod";

const rawEnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1_000).default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(120),
});

export type AppConfig = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
  corsOrigins: string[];
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
};

export function loadEnvironment(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = rawEnvironmentSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map(({ path, message }) => `${path.join(".")}: ${message}`);
    throw new Error(`Invalid environment configuration: ${issues.join("; ")}`);
  }

  const parsed = result.data;
  const corsOrigins = parsed.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (parsed.NODE_ENV === "production" && corsOrigins.includes("*")) {
    throw new Error("Invalid environment configuration: wildcard CORS origin is not allowed in production");
  }

  return {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    logLevel: parsed.LOG_LEVEL,
    corsOrigins,
    supabaseUrl: parsed.SUPABASE_URL.replace(/\/$/, ""),
    supabaseServiceRoleKey: parsed.SUPABASE_SERVICE_ROLE_KEY,
    rateLimitWindowMs: parsed.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: parsed.RATE_LIMIT_MAX,
  };
}

