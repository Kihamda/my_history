import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { FirebaseAuthError } from "./firebase";
import type { AppBindings } from "./types/bindings";
import authRouter from "./routers/auth";
import usersRouter from "./routers/users";
import groupsRouter from "./routers/groups";
import scoutsRouter from "./routers/scouts";
import mastersRouter from "./routers/masters";
import type { AppVariables } from "./middleware/auth";

const app = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

const toStatus = (status: number): ContentfulStatusCode => {
  const normalized = Math.min(599, Math.max(100, Math.trunc(status)));
  return normalized as ContentfulStatusCode;
};

app.onError((error, c) => {
  if (error instanceof FirebaseAuthError) {
    return c.json(
      {
        error: error.code ?? "AUTH_ERROR",
        message: error.message,
      },
      toStatus(error.status)
    );
  }

  if (error instanceof HTTPException) {
    return c.json(
      {
        error: "HTTP_ERROR",
        message: error.message,
      },
      toStatus(error.status)
    );
  }

  console.error("Unhandled error", error);
  return c.json(
    {
      error: "INTERNAL_SERVER_ERROR",
    },
    toStatus(500)
  );
});

app.notFound((c) =>
  c.json(
    {
      error: "NOT_FOUND",
    },
    toStatus(404)
  )
);

app.get("/", (c) =>
  c.json({
    message: "My History backend is running",
    endpoints: {
      auth: "/api/auth/*",
      users: "/api/users/*",
      groups: "/api/groups/*",
      scouts: "/api/scouts/*",
      masters: "/api/masters/*",
    },
  })
);

app.route("/api/auth", authRouter);
app.route("/api/users", usersRouter);
app.route("/api/groups", groupsRouter);
app.route("/api/scouts", scoutsRouter);
app.route("/api/masters", mastersRouter);

export type CloudflareBindings = AppBindings;
export type AppType = typeof app;

export default app;
