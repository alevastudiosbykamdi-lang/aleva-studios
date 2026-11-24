import "dotenv/config";
import { createServer } from "node:http";
import { loadEnvironment } from "./config/env.js";
import { createLogger } from "./config/logger.js";
import { createSupabaseClient } from "./config/supabase.js";
import { createApp } from "./app.js";

const env = loadEnvironment();
const logger = createLogger(env);
const supabase = createSupabaseClient(env);
// Keep the privileged client alive server-side for later modules; Phase 2 does not use it for business data.
void supabase;
const app = createApp(env, logger);
const server = createServer(app);

server.listen(env.port, () => {
  logger.info({ port: env.port, environment: env.nodeEnv }, "Aleva backend listening");
});

let shuttingDown = false;
function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Graceful shutdown started");

  const forceTimer = setTimeout(() => {
    logger.error("Graceful shutdown timed out; forcing exit");
    process.exit(1);
  }, 10_000);
  forceTimer.unref();

  server.close((error) => {
    clearTimeout(forceTimer);
    if (error) {
      logger.error({ errorType: error.name }, "Server shutdown failed");
      process.exitCode = 1;
    }
    void supabase.auth.stopAutoRefresh();
    logger.info("Server shutdown complete");
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reasonType: reason instanceof Error ? reason.name : typeof reason }, "Unhandled promise rejection");
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ errorType: error.name }, "Uncaught exception");
  shutdown("uncaughtException");
});
