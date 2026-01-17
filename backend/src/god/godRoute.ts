import type { AppContext } from "@b/apiRotuer";
import { Hono } from "hono";
import godGroupRouter from "./groupRoute";
import godScoutRouter from "./scoutRoute";

const godRouter = new Hono<AppContext>()
  // ゴッドモード専用ミドルウェア
  .use("*", async (c, next) => {
    const userData = c.var.user;

    if (!userData.auth.isGod) {
      return c.json({ message: "Forbidden" }, 403);
    }
    await next();
  })

  // スカウトのデータを管理
  .route("/scout", godScoutRouter)

  // ユーザーのデータを管理
  .route("/group", godGroupRouter);

export default godRouter;
