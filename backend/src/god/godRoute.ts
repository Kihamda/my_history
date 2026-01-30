import type { AppContext } from "@b/apiRotuer";
import { Hono } from "hono";
import godGroupRouter from "./groupRoute";
import godScoutRouter from "./scoutRoute";
import godUserRouter from "./userRoute";

const godRouter = new Hono<AppContext>()
  // ゴッドモード専用ミドルウェア
  .use("*", async (c, next) => {
    const userData = c.var.user;

    if (!userData.auth.isGod) {
      return c.json({ message: "Forbidden" }, 403);
    }
    await next();
  })

  .get("/", async (c) =>
    c.json({
      isDev: c.env.IS_DEV === "TRUE",
      message:
        c.env.IS_DEV === "TRUE"
          ? "開発環境で良かったね。"
          : "本番環境だよ！気をつけて！",
    }),
  )

  // スカウトのデータを管理
  .route("/scout", godScoutRouter)

  // グループのデータを管理
  .route("/group", godGroupRouter)

  // ユーザーのデータを管理
  .route("/user", godUserRouter);

export default godRouter;
