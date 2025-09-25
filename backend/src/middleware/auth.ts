import type { MiddlewareHandler } from "hono";
import {
  FirebaseAuthError,
  type VerifiedFirebaseToken,
  verifyIdToken,
} from "../firebase";
import type { AppBindings } from "../types/bindings";

export type AppVariables = {
  auth: VerifiedFirebaseToken;
};

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
  const token =
    extractBearerToken(c.req.header("Authorization")) ?? c.req.query("idToken");

  if (!token) {
    throw new FirebaseAuthError("MISSING_ID_TOKEN", 401, "MISSING_ID_TOKEN");
  }

  const verified = await verifyIdToken(c.env, token);
  c.set("auth", verified);
  await next();
};
