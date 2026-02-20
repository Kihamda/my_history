import { authorize, type FirebaseAuthBindings } from "./lib/auth";
import { type Context as honoContext, Hono } from "hono";
import { firestoreMiddleware } from "./lib/firestore/firestore";
import userRouter from "./user/userRoute";
import scoutRouter from "./scout/scoutRoute";
import groupRouter from "./group/groupRoute";
import type { FirebaseIdToken } from "firebase-auth-cloudflare-workers";
import { loadUserData, type UserDataContext } from "./lib/userData";
import godRouter from "./god/godRoute";

interface Envs {
  IS_DEV?: string;
  ASSETS: {
    fetch(path: string): Promise<Response>;
  };
}

export interface AppContext {
  Bindings: FirebaseAuthBindings & Envs;
  Variables: {
    user: UserDataContext;
    token: FirebaseIdToken;
  };
}

export type Context = honoContext<AppContext>;

const apiRouter = new Hono<AppContext>()
  .use("*", firestoreMiddleware)
  .use("*", authorize)
  // APIルート
  .get("/", async (c) =>
    c.json({
      message: "Let's work together -> https://kihamda.net/form",
    }),
  )

  // ユーザー情報
  .route("/user", userRouter)

  .use("*", loadUserData)
  // スカウト情報
  .route("/scout", scoutRouter)

  // グループ情報
  .route("/group", groupRouter)

  // ゴッドモード
  .route("/god", godRouter);

export default apiRouter;
