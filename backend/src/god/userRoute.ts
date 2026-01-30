import type { AppContext } from "@b/apiRotuer";
import { db } from "@b/lib/firestore/firestore";
import { UserRecordSchemaString } from "@b/lib/firestore/schemas";
import { genIdSchema } from "@b/lib/randomId";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod/v4";

const godUserRouter = new Hono<AppContext>()

  // ユーザーのデータをクエリして取得
  .get(
    "/getUserData",
    zValidator(
      "query",
      z.object({
        id: genIdSchema.optional(),
        membership: z.string().optional(),
        invites: z.string().optional(),
        sharedby: z.string().optional(),
        email: z.string().optional(),
        isGod: z.enum(["true", "false", "both"]).optional(),
      }),
    ),
    async (c) => {
      // データ取得
      const id = c.req.valid("query").id || "";

      if (id.length != 0) {
        const result = await db().users.get(id);
        if (result == null) {
          return c.json([], 201); // データが見つからなかった場合は空オブジェクトを返す
        } else {
          return c.json([{ ...result, doc_id: id }]);
        }
      }

      type QueryType = ReturnType<typeof db>["users"]["lis"] extends (
        query: infer Q,
      ) => any
        ? Q
        : never;
      let query: QueryType = [];

      const membership = c.req.valid("query").membership || "";
      if (membership.length != 0) {
        query.push({
          field: "auth.memberships",
          op: "array-contains",
          value: membership,
        });
      }
      const invites = c.req.valid("query").invites || "";
      if (invites.length != 0) {
        query.push({
          field: "auth.invites",
          op: "array-contains",
          value: invites,
        });
      }
      const sharedby = c.req.valid("query").sharedby || "";
      if (sharedby.length != 0) {
        query.push({
          field: "auth.shares",
          op: "array-contains",
          value: sharedby,
        });
      }
      const email = c.req.valid("query").email || "";
      if (email.length != 0) {
        query.push({ field: "email", op: "==", value: email });
      }
      const isGod = c.req.valid("query").isGod || "both";
      if (isGod !== "both") {
        query.push({
          field: "auth.isGod",
          op: "==",
          value: isGod === "true" ? true : false,
        });
      }

      // 両方指定された場合は両方で検索して結果を結合して返す
      const result = await db().users.lis(query);
      return c.json(result);
    },
  )

  // ユーザーのデータ更新
  .post(
    "/:id/setUserData",
    zValidator("param", z.object({ id: genIdSchema })),
    zValidator(
      "json",

      UserRecordSchemaString,
    ),
    async (c) => {
      const id = c.req.valid("param").id;
      const data = c.req.valid("json");
      const newData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await db().users.set(id, newData);
      return c.json({ message: "God routes are operational." });
    },
  )

  // ユーザーのデータ削除
  .delete(
    "/:id/deleteUserData",
    zValidator(
      "param",
      z.object({
        id: genIdSchema,
      }),
    ),
    async (c) => {
      const id = c.req.valid("param").id;
      await db().scouts.del(id);
      return c.json({ message: "スカウトデータを削除しました" });
    },
  );

export default godUserRouter;
