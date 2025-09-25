import { Hono } from "hono";
import type { Context } from "hono";
import {
  FirebaseAuthError,
  refreshIdToken,
  signInWithPassword,
} from "../firebase";
import { requireAuth, type AppVariables } from "../middleware/auth";
import type { AppBindings } from "../types/bindings";

const authRouter = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

type RouterContext = Context<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>;

interface LoginRequestBody {
  email?: string;
  password?: string;
}

interface RefreshRequestBody {
  refreshToken?: string;
}

const parseJsonBody = async <T>(c: RouterContext): Promise<T> => {
  try {
    return (await c.req.json()) as T;
  } catch (error) {
    console.warn("Failed to parse JSON payload", error);
    throw new FirebaseAuthError("INVALID_JSON", 400, "INVALID_JSON");
  }
};

authRouter.post("/login", async (c) => {
  const body = await parseJsonBody<LoginRequestBody>(c);

  if (typeof body.email !== "string" || typeof body.password !== "string") {
    throw new FirebaseAuthError(
      "EMAIL_AND_PASSWORD_REQUIRED",
      400,
      "EMAIL_AND_PASSWORD_REQUIRED"
    );
  }

  const result = await signInWithPassword(c.env, body.email, body.password);

  return c.json({
    tokens: result.tokens,
    user: result.user,
  });
});

authRouter.post("/refresh", async (c) => {
  const body = await parseJsonBody<RefreshRequestBody>(c);

  if (typeof body.refreshToken !== "string") {
    throw new FirebaseAuthError(
      "MISSING_REFRESH_TOKEN",
      400,
      "MISSING_REFRESH_TOKEN"
    );
  }

  const result = await refreshIdToken(c.env, body.refreshToken);

  return c.json({
    tokens: result.tokens,
    user: result.user,
  });
});

authRouter.get("/me", requireAuth, (c) => {
  const auth = c.get("auth");

  return c.json({
    token: auth.token,
    claims: auth.claims,
    user: auth.user,
  });
});

export default authRouter;
