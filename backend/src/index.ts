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
    c.env.IS_DEV === "TRUE" && console.error("HTTPException", error);
    return c.json(
      {
        message: "INTERNAL_SERVER_ERROR",
      },
      toStatus(500),
    );
  })

  // 未定義パスにアクセスされた場合のフォールバック。
  .notFound((c) =>
    c.json(
      {
        message: "NOT_FOUND",
      },
      toStatus(404),
    ),
  )

  .use(
    "*",
    cors({
      origin: (_, c) => {
        const allowed =
          c.env.IS_DEV === "TRUE"
            ? "*"
            : null; /* 本番環境では CORS を許可しない */
        return allowed;
      },
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  )

  // ルートパスはbuildTmpの中身をいい感じに返す
  .get("/", (c) => c.env.ASSETS.fetch("http://assets.local/index.html"))

  // 静的ファイルの提供。URL パスに対応するファイルが存在しない場合は 404 を返す。
  .get("/app/*", (c) => c.env.ASSETS.fetch("http://assets.local/spa.html"))
  .get("/auth/*", (c) => c.env.ASSETS.fetch("http://assets.local/spa.html"))
  .get("/god/*", (c) => c.env.ASSETS.fetch("http://assets.local/spa.html"))

  // ドメイン毎のルーターを/api 以下にマウントする。
  // v1から増やすとき、v2にしたくないならv1aとかにする。
  .route("/apiv1/", apiRouter)

  // その他の静的ファイル。URL パスに対応するファイルが存在しない場合は 404 を返す。
  .get("/*", (c) => c.env.ASSETS.fetch(c.req.url.split("?")[0]));

export default app;

export type AppType = typeof app;
