export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": [
        "tsc_admin=",
        "Max-Age=0",
        "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Strict"
      ].join("; ")
    }
  });
}
