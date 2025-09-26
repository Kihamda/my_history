// 認証付きエンドポイントで共通利用する Hono ミドルウェア。
import { verifyFirebaseAuth, getFirebaseToken } from "@hono/firebase-auth";
import type { MiddlewareHandler } from "hono";
import type {
  FirebaseIdToken,
  KeyStorer,
} from "firebase-auth-cloudflare-workers";
import { FirebaseAuthError, lookupUserByIdToken } from "../firebase";
import type { FirebaseAuthUser } from "../firebase";
import type { AppBindings } from "../types/bindings";

export interface AuthContext {
  token: string;
  claims: FirebaseIdToken;
  user: FirebaseAuthUser;
}

export type AppVariables = {
  auth: AuthContext;
};

class MemoryKeyStore implements KeyStorer {
  private cache: {
    value: string;
    expiresAt: number;
  } | null = null;

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

const keyStore = new MemoryKeyStore();

const ensureBinding = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new FirebaseAuthError(
      `Missing binding: ${name}`,
      500,
      "MISSING_CONFIGURATION"
    );
  }
  return value;
};

// Authorization ヘッダーから Bearer トークン部分だけを取り出すヘルパー。
export const extractBearerToken = (
  authorizationHeader: string | undefined
): string | null => {
  if (!authorizationHeader) {
    return null;
  }
  const [scheme, token] = authorizationHeader.split(" ");
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
    throw new FirebaseAuthError("MISSING_ID_TOKEN", 401, "MISSING_ID_TOKEN");
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
      throw new FirebaseAuthError("INVALID_ID_TOKEN", 401, "INVALID_ID_TOKEN");
    }

    const user = await lookupUserByIdToken(c.env, token);
    c.set("auth", { token, claims, user });
    await next();
  });
};
