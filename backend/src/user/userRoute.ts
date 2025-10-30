import { Hono } from "hono";
import { AppContext } from "../apiRotuer";
import { zValidator } from "@hono/zod-validator";
import { UserRecordSchema } from "../lib/firestore/schemas";
import { getUserProfile } from "./services/userService";
import {
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from "./handlers";

const userRouter = new Hono<AppContext>()
  // ルート (GET /user) は認証済みユーザーの情報を返す
  .get("/", async (c) => {
    const userData = await getUserProfile(c);
    return c.json(userData);
  })

  // ユーザー新規作成 (初回登録時)
  .post("/", zValidator("json", UserRecordSchema), async (c) => {
    const data = c.req.valid("json");
    const result = await createUserHandler(c, data);
    return c.json(result, 201);
  })

  // ユーザー情報更新
  .put("/", zValidator("json", UserRecordSchema.partial()), async (c) => {
    const data = c.req.valid("json");
    const result = await updateUserHandler(c, data);
    return c.json(result);
  })

  // ユーザー削除
  .delete("/", async (c) => {
    const result = await deleteUserHandler(c);
    return c.json(result);
  });

export default userRouter;
