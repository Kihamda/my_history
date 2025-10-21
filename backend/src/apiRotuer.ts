import { authorize, FirebaseAuthBindings } from "./lib/auth";
import { Context as honoContext, Hono } from "hono";
import { firestoreMiddleware } from "./lib/firestore/firestore";
import { FirestoreClient } from "firebase-rest-firestore";
import userRouter from "./user/userRoute";
import scoutRouter from "./scout/scoutRoute";
import { FirebaseIdToken } from "firebase-auth-cloudflare-workers";

export interface AppContext {
  Bindings: FirebaseAuthBindings;
  Variables: {
    authToken: FirebaseIdToken;
    db: FirestoreClient;
  };
}

export type Context = honoContext<AppContext>;

const apiRouter = new Hono<AppContext>()
  .use("*", firestoreMiddleware)
  .use("*", authorize)
  // APIルート
  .get("/", async (c) =>
    c.json({
      message: "Let's work together -> kihamda.net",
    })
  )

  // ユーザー情報
  .route("/user", userRouter)

  // スカウト情報
  .route("/scout", scoutRouter);
export default apiRouter;
