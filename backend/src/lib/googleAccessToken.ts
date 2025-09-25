import { SignJWT, importPKCS8 } from "jose";
import type { ServiceAccountBindings } from "../types/bindings";

const DEFAULT_TOKEN_AUDIENCE = "https://oauth2.googleapis.com/token";
const DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/datastore",
  "https://www.googleapis.com/auth/userinfo.email",
];

interface CachedToken {
  token: string;
  expiresAt: number;
  scopeKey: string;
}

const tokenCache = new WeakMap<ServiceAccountBindings, CachedToken>();

const CRYPTO_ALG = "RS256";

const normalizePrivateKey = (key: string): string =>
  key.includes("-----BEGIN")
    ? key.replace(/\r/g, "").replace(/\\n/g, "\n")
    : key;

const getScopeKey = (scopes: string[]): string => scopes.sort().join(" ");

export const getServiceAccountAccessToken = async (
  env: ServiceAccountBindings,
  scopes: string[] = DEFAULT_SCOPES
): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  const expiresInBuffer = 60; // seconds
  const scopeKey = getScopeKey(scopes);

  const cached = tokenCache.get(env);
  if (
    cached &&
    cached.scopeKey === scopeKey &&
    cached.expiresAt - expiresInBuffer > now
  ) {
    return cached.token;
  }

  const clientEmail = env.GCP_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(env.GCP_PRIVATE_KEY);

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing service account credentials. Set GCP_CLIENT_EMAIL and GCP_PRIVATE_KEY."
    );
  }

  const audience = env.GCP_TOKEN_AUDIENCE ?? DEFAULT_TOKEN_AUDIENCE;
  const iat = now;
  const exp = iat + 3600; // 1 hour validity

  const pkcs8 = await importPKCS8(privateKey, CRYPTO_ALG);

  const assertion = await new SignJWT({
    scope: scopeKey,
  })
    .setProtectedHeader({ alg: CRYPTO_ALG, typ: "JWT" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setIssuer(clientEmail)
    .setSubject(clientEmail)
    .setAudience(audience)
    .sign(pkcs8);

  const params = new URLSearchParams();
  params.set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
  params.set("assertion", assertion);

  const response = await fetch(audience, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(
      `Failed to obtain access token: ${
        payload.error_description ?? payload.error ?? response.statusText
      }`
    );
  }

  const expiresAt = now + (payload.expires_in ?? 3600);
  tokenCache.set(env, {
    token: payload.access_token,
    expiresAt,
    scopeKey,
  });

  return payload.access_token;
};
