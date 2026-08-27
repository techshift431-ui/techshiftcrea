export async function onRequestPost({ request, env }) {
  const { password } = await request.json().catch(() => ({}));

  if (!password || !env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return json({ error: "Invalid password" }, 401);
  }

  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const value = `admin:${expiresAt}`;
  const secret = env.ADMIN_SECRET || env.ADMIN_PASSWORD;
  const signature = await hmac(value, secret);

  // Encode each component separately. This avoids the old bug where
  // a "." byte inside the binary HMAC could be mistaken for the separator.
  const token = `${base64url(value)}.${base64urlBytes(signature)}`;

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": [
        `tsc_admin=${token}`,
        "Max-Age=86400",
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Strict"
      ].join("; ")
    }
  });
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
}

function base64url(text) {
  return btoa(text)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlBytes(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
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
