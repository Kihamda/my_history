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
import { serveStatic } from "hono/cloudflare-workers";

// Hono のレスポンスに利用できる範囲へ HTTP ステータスコードを正規化する。
const toStatus = (status: number): ContentfulStatusCode => {
  const normalized = Math.min(599, Math.max(100, Math.trunc(status)));
  return normalized as ContentfulStatusCode;
};

// Cloudflare Workers 上で動かす Hono アプリケーションの本体。
const app = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>()

  // 共通のエラーハンドラー。FirebaseAuthError を優先的に扱い、JSON 形式で返す。
  .onError((error, c) => {
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
  })

  // 未定義パスにアクセスされた場合のフォールバック。
  .notFound((c) =>
    c.json(
      {
        error: "NOT_FOUND",
      },
      toStatus(404)
    )
  )

  // ルートパスはbuildTmpの中身をいい感じに返す
  .get("/", serveStatic({ manifest: { relative: true }, path: "index.html" }))
  .get(
    "/app/*",
    serveStatic({ manifest: { relative: true }, path: "spa.html" })
  )
  .get(
    "/auth/*",
    serveStatic({ manifest: { relative: true }, path: "spa.html" })
  )
  .get("/help/*", serveStatic({ manifest: { relative: true }, path: "help/" }))
  .get("/*", serveStatic({ manifest: { relative: true } }))
  //

  // ドメイン毎のルーターを/api 以下にマウントする。
  .route("/api/auth", authRouter)
  .route("/api/users", usersRouter)
  .route("/api/groups", groupsRouter)
  .route("/api/scouts", scoutsRouter)
  .route("/api/masters", mastersRouter);

export type CloudflareBindings = AppBindings;
export type AppType = typeof app;

export default app;
