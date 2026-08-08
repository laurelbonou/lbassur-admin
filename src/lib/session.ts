/**
 * Session de l'espace d'administration.
 *
 * Le cookie porte un jeton signé (HMAC-SHA256) contenant sa date d'expiration.
 * Auparavant il valait la chaîne constante « authenticated » et le proxy se
 * contentait de vérifier sa présence : poser n'importe quelle valeur depuis les
 * outils du navigateur suffisait à entrer sans connaître le mot de passe.
 *
 * L'API Web Crypto est utilisée plutôt que le module `crypto` de Node, car ce
 * fichier est aussi chargé par le proxy, qui s'exécute sur le runtime Edge.
 */

export const SESSION_COOKIE = "admin_session";

/** Durée de validité d'une session ouverte. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

/**
 * Comparaison à temps constant : un `!==` s'arrête au premier caractère
 * différent, ce qui laisse deviner la signature attendue en mesurant le temps
 * de réponse.
 */
function matches(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  // Aucune valeur de repli : mieux vaut refuser toute connexion qu'accepter des
  // sessions signées avec un secret que tout le monde peut deviner.
  return secret && secret.length >= 16 ? secret : null;
}

export async function createSessionToken(): Promise<string | null> {
  const secret = readSecret();
  if (!secret) return null;

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = toBase64Url(encoder.encode(JSON.stringify({ exp: expiresAt })));
  return `${payload}.${await sign(payload, secret)}`;
}

/**
 * Vérifie signature et expiration. Utilisable depuis le proxy (Edge) comme
 * depuis le serveur.
 */
export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  const secret = readSecret();
  if (!secret || !token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  if (!matches(signature, await sign(payload, secret))) return false;

  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
