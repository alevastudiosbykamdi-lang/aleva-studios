import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { after, before, describe, it } from "node:test";
import express from "express";
import { loadEnvironment } from "../src/config/env.js";
import { createLogger } from "../src/config/logger.js";
import { createApp } from "../src/app.js";
import { validateBody } from "../src/middleware/validate.js";
import { createErrorHandler } from "../src/middleware/error-handler.js";
import { ApiError } from "../src/utils/api-error.js";
import { z } from "zod";

const logger = createLogger({ nodeEnv: "test", logLevel: "silent" });
const config = loadEnvironment({
  NODE_ENV: "test",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-only-key",
  CORS_ORIGINS: "http://localhost:5173",
});

describe("environment configuration", () => {
  it("rejects invalid ports and missing Supabase configuration", () => {
    assert.throws(() => loadEnvironment({ PORT: "70000" }), /Invalid environment configuration/);
  });

  it("rejects wildcard CORS in production", () => {
    assert.throws(() => loadEnvironment({
      NODE_ENV: "production",
      CORS_ORIGINS: "*",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "test-only-key",
    }), /wildcard CORS/);
  });
});

describe("request validation and error response", () => {
  const app = express();
  app.use(express.json());
  app.post("/validated", validateBody(z.object({ name: z.string().min(1) })), (_req, res) => {
    res.json({ success: true, data: res.locals.validated });
  });
  app.post("/json", (_req, res) => res.json({ success: true }));
  app.get("/failure", (_req, _res, next) => next(new ApiError(409, "CONFLICT", "Conflict occurred")));
  app.use(createErrorHandler(logger, true));
  const server = createServer(app);
  let baseUrl: string;

  before(async () => {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });
  after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

  it("accepts valid data and rejects invalid request bodies consistently", async () => {
    const valid = await fetch(`${baseUrl}/validated`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Aleva" }) });
    assert.equal(valid.status, 200);
    assert.equal((await valid.json()).success, true);

    const invalid = await fetch(`${baseUrl}/validated`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "" }) });
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).error.code, "VALIDATION_ERROR");
  });

  it("returns stable errors without exposing production details", async () => {
    const response = await fetch(`${baseUrl}/failure`);
    const body = await response.json();
    assert.equal(response.status, 409);
    assert.equal(body.error.code, "CONFLICT");
    assert.equal("stack" in body.error, false);
    assert.equal("debugMessage" in body.error, false);
  });

  it("returns a client error for malformed JSON", async () => {
    const response = await fetch(`${baseUrl}/json`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, "INVALID_JSON");
  });
});

describe("foundation health and security", () => {
  const app = createApp(config, logger, async () => true);
  const server = createServer(app);
  let baseUrl: string;

  before(async () => {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });
  after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

  it("serves liveness/readiness and adds secure response headers", async () => {
    const live = await fetch(`${baseUrl}/health/live`);
    assert.equal(live.status, 200);
    assert.equal(live.headers.get("x-content-type-options"), "nosniff");
    assert.ok(live.headers.get("x-request-id"));
    assert.equal((await live.json()).data.status, "ok");

    const ready = await fetch(`${baseUrl}/health/ready`);
    assert.equal(ready.status, 200);
    assert.equal((await ready.json()).data.status, "ready");
  });

  it("rejects unlisted browser origins and produces a JSON 404", async () => {
    const corsResponse = await fetch(`${baseUrl}/health/live`, { headers: { Origin: "https://unlisted.example" } });
    assert.equal(corsResponse.headers.get("access-control-allow-origin"), null);
    assert.equal(corsResponse.status, 403);
    assert.equal((await corsResponse.json()).error.code, "CORS_ORIGIN_DENIED");

    const missing = await fetch(`${baseUrl}/missing`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, "NOT_FOUND");
  });
});
