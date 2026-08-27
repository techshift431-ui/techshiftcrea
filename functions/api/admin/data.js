export async function onRequestGet({ request, env }) {
  if (!(await valid(request, env))) {
    return json({ error: "Unauthorized" }, 401);
  }

  const { results } = await env.DB
    .prepare(
      "SELECT id,type,data,created_at FROM submissions ORDER BY id DESC LIMIT 500"
    )
    .all();

  return json({
    results: results.map(row => ({
      ...row,
      data: safeParse(row.data)
    }))
  }, 200);
}

async function valid(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)tsc_admin=([^;]+)/);
  if (!match) return false;

  try {
    const token = match[1];
    const separator = token.indexOf(".");
    if (separator <= 0) return false;

    const value = fromBase64url(token.slice(0, separator));
    const signature = fromBase64urlBytes(token.slice(separator + 1));

    if (!value.startsWith("admin:")) return false;

    const expiresAt = Number(value.slice(6));
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

    const secret = env.ADMIN_SECRET || env.ADMIN_PASSWORD;
    if (!secret) return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    return crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(value)
    );
  } catch {
    return false;
  }
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function fromBase64url(text) {
  const normalized = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return atob(padded);
}

function fromBase64urlBytes(text) {
  const binary = fromBase64url(text);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
