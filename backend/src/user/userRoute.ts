import { Hono } from "hono";
import type { AppContext } from "../apiRotuer";
import { zValidator } from "@hono/zod-validator";
import { UserRecordSchema } from "../lib/firestore/schemas";
import {
  createUserHandler,
  deleteUserHandler,
  updateUserProfileHandler,
  searchUserHandler,
} from "./handlers";
import { z } from "zod/v4";
import { loadUserData } from "@b/lib/userData";
import userSettingsRouter from "./userSettingsRoute";
import { getSharedScoutsHandler, getUserHandler } from "./getHandlers";

const userRouter = new Hono<AppContext>()
  // ユーザー新規作成 (初回登録時)
  .post(
    "/createUser",
    zValidator("json", UserRecordSchema.shape.profile),
    async (c) => {
      const data = c.req.valid("json");
      const result = await createUserHandler(c, data);
      return c.json(result, 201);
    },
  )
  // これだけはユーザーレコードによる認証不要(ないから)
  // これからは必要
  .use("*", loadUserData)

  // ルート (GET /user) は認証済みユーザーの情報を返す
  .get("/me", async (c) => {
    const userData = await getUserHandler(c);
    return c.json(userData);
  })

  // メールアドレスから検索
  .post(
    "/lookupByEmail",
    zValidator("json", z.object({ email: z.email() })),
    async (c) => {
      const { email } = c.req.valid("json");
      const userData = await searchUserHandler(email);
      return c.json(userData);
    },
  )

  .get(
    "/sharedScouts",
    zValidator(
      "query",
      z.object({ offset: z.string().optional().transform(Number) }),
    ),
    async (c) => {
      const offset = c.req.valid("query").offset ?? 0;
      return c.json(await getSharedScoutsHandler(c, offset));
    },
  )

  // ユーザー情報更新
  .post(
    "/updateProfile",
    zValidator("json", UserRecordSchema.shape.profile),
    async (c) => {
      const data = c.req.valid("json");
      const result = await updateUserProfileHandler(c, data);
      return c.json(result);
    },
  )

  // ユーザー削除
  .delete("/delete", async (c) => {
    const result = await deleteUserHandler(c);
    return c.json(result);
  })

  // ユーザーauthの設定をする
  .route("/auth", userSettingsRouter);
export default userRouter;
