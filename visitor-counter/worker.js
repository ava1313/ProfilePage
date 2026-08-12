import { DurableObject } from "cloudflare:workers";

const ALLOWED_ORIGINS = new Set([
  "https://avagianos-dev.gr",
  "https://www.avagianos-dev.gr",
  "https://ava1313.github.io",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);

function responseHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Accept",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders(origin),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (url.pathname !== "/api/visits") {
      return new Response("Not found", { status: 404 });
    }

    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response("Origin not allowed", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: responseHeaders(origin) });
    }

    if (request.method !== "GET" && request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin);
    }

    const id = env.VISIT_COUNTER.idFromName("portfolio");
    const counter = env.VISIT_COUNTER.get(id);
    const count = request.method === "POST"
      ? await counter.increment()
      : await counter.value();

    return json({ count }, 200, origin);
  },
};

export class VisitCounter extends DurableObject {
  async increment() {
    const current = (await this.ctx.storage.get("total")) || 0;
    const next = current + 1;
    await this.ctx.storage.put("total", next);
    return next;
  }

  async value() {
    return (await this.ctx.storage.get("total")) || 0;
  }
}
