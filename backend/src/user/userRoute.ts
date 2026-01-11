import { Hono } from "hono";
import type { AppContext } from "../apiRotuer";
import { zValidator } from "@hono/zod-validator";
import { UserRecordSchema } from "../lib/firestore/schemas";
import {
  getUserHandler,
  createUserHandler,
  deleteUserHandler,
  updateUserProfileHandler,
  searchUserHandler,
  acceptUserInviteHandler,
} from "./handlers";
import { z } from "zod/v4";
import { genIdSchema } from "@b/lib/randomId";
import { loadUserData } from "@b/lib/userData";

const userRouter = new Hono<AppContext>()
  // ルート (GET /user) は認証済みユーザーの情報を返す
  .use("/me", loadUserData)
  .get("/me", async (c) => {
    const userData = await getUserHandler(c);
    return c.json(userData);
  })

  // メールアドレスから検索
  .use("/lookupByEmail", loadUserData)
  .post(
    "/lookupByEmail",
    zValidator("json", z.object({ email: z.email() })),
    async (c) => {
      const { email } = c.req.valid("json");
      const userData = await searchUserHandler(email);
      return c.json(userData);
    }
  )

  // グループ招待受諾
  .use("/acceptInvite", loadUserData)
  .post(
    "/acceptInvite",
    zValidator("json", z.object({ groupCode: genIdSchema })),
    async (c) => {
      const { groupCode } = c.req.valid("json");
      const result = await acceptUserInviteHandler(c, groupCode);
      return c.json(result);
    }
  )

  // ユーザー新規作成 (初回登録時)
  .post(
    "/createUser",
    zValidator("json", UserRecordSchema.shape.profile),
    async (c) => {
      const data = c.req.valid("json");
      const result = await createUserHandler(c, data);
      return c.json(result, 201);
    }
  )

  // ユーザー情報更新
  .use("/updateProfile", loadUserData)
  .post(
    "/updateProfile",
    zValidator("json", UserRecordSchema.shape.profile),
    async (c) => {
      const data = c.req.valid("json");
      const result = await updateUserProfileHandler(c, data);
      return c.json(result);
    }
  )

  // ユーザー削除
  .use("/delete", loadUserData)
  .delete("/delete", async (c) => {
    const result = await deleteUserHandler(c);
    return c.json(result);
  });

export default userRouter;
