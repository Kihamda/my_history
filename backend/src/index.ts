import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import apiRouter, { type AppContext } from "./apiRotuer";
import { cors } from "hono/cors";

// Hono のレスポンスに利用できる範囲へ HTTP ステータスコードを正規化する。
const toStatus = (status: number): ContentfulStatusCode => {
  const normalized = Math.min(599, Math.max(100, Math.trunc(status)));
  return normalized as ContentfulStatusCode;
};

// Cloudflare Workers 上で動かす Hono アプリケーションの本体。
const app = new Hono<AppContext>()

  // 共通のエラーハンドラー。HTTPException を尊重し、それ以外は 500 を返す。
  .onError((error, c) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }

    console.error("Unhandled error", error);
    return c.json(
      {
        message: "INTERNAL_SERVER_ERROR",
      },
      toStatus(500),
    );
  })

  .use(
    "*",
    cors({
      origin: ["https://myhis.kihamda.net", "http://localhost:5173"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  )

  // 未定義パスにアクセスされた場合のフォールバック。
  .notFound((c) =>
    c.json(
      {
        message: "NOT_FOUND",
      },
      toStatus(404),
    ),
  )

  // ルートパスはbuildTmpの中身をいい感じに返す
  .get("/", (c) =>
    c.env.ASSETS.fetch(new URL("/index.html", c.req.url).toString()),
  )

  .get("/app/*", (c) =>
    c.env.ASSETS.fetch(new URL("/spa.html", c.req.url).toString()),
  )
  .get("/auth/*", (c) =>
    c.env.ASSETS.fetch(new URL("/spa.html", c.req.url).toString()),
  )
  .get("/god/*", (c) =>
    c.env.ASSETS.fetch(new URL("/spa.html", c.req.url).toString()),
  )
  .get("/*", (c) => {
    const url = new URL(c.req.url);
    return c.env.ASSETS.fetch(new URL(url.pathname, url.origin).toString());
  })
  // ドメイン毎のルーターを/api 以下にマウントする。
  // v1から増やすとき、v2にしたくないならv1aとかにする。
  .route("/apiv1/", apiRouter);

export default app;

export type AppType = typeof app;
