import type { FirebaseIdToken } from "firebase-auth-cloudflare-workers";
import { Auth, WorkersKVStoreSingle } from "firebase-auth-cloudflare-workers";
import type { KVNamespace } from "@cloudflare/workers-types";
import { Context } from "../apiRotuer";

// eslint-disable-next-line consistent-return
export const authorize = async (c: Context, next: () => Promise<void>) => {
  const header = c.req.header("Authorization");
  if (header == undefined) {
    return c.json("UNAUTHORIZED", 401);
  }
  const token = await verifyJWT(header, c.env);
  if (token == null) {
    return c.json("UNAUTHORIZED", 401);
  }

  if (!token.email_verified) {
    return c.json("EMAIL_VERIFY_MISSING", 403);
  }

  // Optionally attach token to context for downstream handlers
  c.set("authToken", token);
  await next();
};

export interface FirebaseAuthBindings {
  PROJECT_ID: string;
  PUBLIC_JWK_CACHE_KEY: string;
  MY_HISTORY_KV_CACHE: KVNamespace;
  FIREBASE_SERVICE_ACCOUNT_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_AUTH_EMULATOR_HOST: string;
}

const verifyJWT = async (
  authorizationHeader: string,
  env: FirebaseAuthBindings
): Promise<FirebaseIdToken | null> => {
  const jwt = authorizationHeader.replace(/Bearer\s+/i, "").trim();
  if (!jwt) {
    return null;
  }
  try {
    const auth = Auth.getOrInitialize(
      env.PROJECT_ID,
      WorkersKVStoreSingle.getOrInitialize(
        env.PUBLIC_JWK_CACHE_KEY,
        env.MY_HISTORY_KV_CACHE
      )
    );
    const firebaseToken = await auth.verifyIdToken(jwt, false, env);
    return firebaseToken;
  } catch (error) {
    return null;
  }
};
