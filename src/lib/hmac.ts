// Simple demo HMAC using Web Crypto (SHA-256 over payload + secret)
export async function hmacHex(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign", "verify"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const bytes = new Uint8Array(sigBuffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}


