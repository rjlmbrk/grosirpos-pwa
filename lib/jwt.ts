const JWT_SECRET: string = process.env.JWT_SECRET ?? (() => {
  throw new Error("JWT_SECRET environment variable is not set");
})();

interface JwtPayload {
  userId: string;
  username: string;
  role: string;
  nama: string;
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createSignature(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature)),
  );
}

export async function verifyTokenEdge(
  token: string,
): Promise<JwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [, payloadB64, signature] = parts;
    const expectedSig = await createSignature(
      parts[0] + "." + payloadB64,
    );

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));

    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      nama: payload.nama,
    };
  } catch {
    return null;
  }
}
