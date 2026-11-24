import { Router } from "express";
import type { AppConfig } from "../config/env.js";
import type { Logger } from "pino";
import { checkSupabaseReadiness } from "../config/supabase.js";

export function createHealthRouter(
  config: AppConfig,
  logger: Logger,
  readinessCheck = checkSupabaseReadiness,
) {
  const router = Router();

  router.get("/live", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  router.get("/ready", async (_req, res) => {
    const supabaseReady = await readinessCheck(config);
    if (!supabaseReady) {
      logger.warn("Readiness check failed for Supabase REST API");
      res.status(503).json({ success: false, error: { code: "NOT_READY", message: "A required dependency is unavailable" } });
      return;
    }
    res.json({ success: true, data: { status: "ready" } });
  });

  return router;
}
