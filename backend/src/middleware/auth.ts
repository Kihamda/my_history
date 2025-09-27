import { getFirebaseToken, verifyFirebaseAuth } from "@hono/firebase-auth";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHandler } from "hono";
import type {
  FirebaseIdToken,
  KeyStorer,
} from "firebase-auth-cloudflare-workers";
import type { AppBindings } from "../types/bindings";

export interface AuthContext {
  token: string;
  claims: FirebaseIdToken;
  uid: string;
  email?: string;
  groupId: string;
}

export type AppVariables = {
  auth: AuthContext;
};

class EphemeralKeyStore implements KeyStorer {
  private cache: { value: string; expiresAt: number } | null = null;

  async get<ExpectedValue = unknown>(): Promise<ExpectedValue | null> {
    if (!this.cache || this.cache.expiresAt <= Date.now()) {
      return null;
    }
    return this.cache.value as unknown as ExpectedValue;
  }

  async put(value: string, expirationTtl: number): Promise<void> {
    this.cache = {
      value,
      expiresAt: Date.now() + expirationTtl * 1000,
    };
  }
}

const keyStore = new EphemeralKeyStore();

const ensureBinding = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new HTTPException(500, {
      message: `Missing binding: ${name}`,
    });
  }
  return value;
};

const extractBearerToken = (authorization?: string): string | null => {
  if (!authorization) {
    return null;
  }
  const [scheme, token] = authorization.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token.trim();
};

export const requireAuth: MiddlewareHandler<{
  Bindings: AppBindings;
  Variables: AppVariables;
}> = async (c, next) => {
  const token = extractBearerToken(c.req.header("Authorization"));
  if (!token) {
    throw new HTTPException(401, { message: "MISSING_ID_TOKEN" });
  }

  const projectId = ensureBinding(
    c.env.FIREBASE_PROJECT_ID,
    "FIREBASE_PROJECT_ID"
  );

  const verifier = verifyFirebaseAuth({
    projectId,
    keyStore,
    firebaseEmulatorHost: c.env.FIREBASE_AUTH_EMULATOR_HOST,
    disableErrorLog: true,
  });

  await verifier(c, async () => {
    const claims = getFirebaseToken(c);
    if (!claims) {
      throw new HTTPException(401, { message: "INVALID_ID_TOKEN" });
    }

    const groupId = (claims as Record<string, unknown>).groupId;
    if (typeof groupId !== "string" || !groupId) {
      throw new HTTPException(403, { message: "GROUP_NOT_ASSIGNED" });
    }

    c.set("auth", {
      token,
      claims,
      uid: claims.user_id,
      email: claims.email ?? undefined,
      groupId,
    });

    await next();
  });
};
