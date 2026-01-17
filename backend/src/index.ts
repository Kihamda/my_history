import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import apiRouter from "./apiRotuer";
import { serveStatic } from "hono/cloudflare-workers";
import { cors } from "hono/cors";

// Hono のレスポンスに利用できる範囲へ HTTP ステータスコードを正規化する。
const toStatus = (status: number): ContentfulStatusCode => {
  const normalized = Math.min(599, Math.max(100, Math.trunc(status)));
  return normalized as ContentfulStatusCode;
};

// Cloudflare Workers 上で動かす Hono アプリケーションの本体。
const app = new Hono()

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
  .use(
    "*",
    cors({
      origin: [
        "https://myhis.kihamda.net",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    })
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
  .get(
    "/god/*",
    serveStatic({ manifest: { relative: true }, path: "spa.html" })
  )
  .get("/*", serveStatic({ manifest: { relative: true } }))
  //

  // ドメイン毎のルーターを/api 以下にマウントする。
  // v1から増やすとき、v2にしたくないならv1aとかにする。
  .route("/apiv1/", apiRouter);

export default app;
