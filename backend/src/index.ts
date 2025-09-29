import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import groupsRouter from "./routers/groups";
import scoutsRouter from "./routers/scouts";
import type { AppVariables } from "./middleware/auth";
import { serveStatic } from "hono/cloudflare-workers";
import { VerifyFirebaseAuthEnv } from "@hono/firebase-auth";

// Hono のレスポンスに利用できる範囲へ HTTP ステータスコードを正規化する。
const toStatus = (status: number): ContentfulStatusCode => {
  const normalized = Math.min(599, Math.max(100, Math.trunc(status)));
  return normalized as ContentfulStatusCode;
};

// Cloudflare Workers 上で動かす Hono アプリケーションの本体。
const app = new Hono<{
  Bindings: VerifyFirebaseAuthEnv;
  Variables: AppVariables;
}>()

  // 共通のエラーハンドラー。HTTPException を尊重し、それ以外は 500 を返す。
  .onError((error, c) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
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
  .route("/api/groups", groupsRouter)
  .route("/api/scouts", scoutsRouter);

export type CloudflareBindings = AppBindings;
export type AppType = typeof app;

export default app;
