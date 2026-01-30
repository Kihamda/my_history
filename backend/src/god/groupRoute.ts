import type { AppContext } from "@b/apiRotuer";
import { db } from "@b/lib/firestore/firestore";
import { GroupRecordSchema } from "@b/lib/firestore/schemas";
import { genIdSchema } from "@b/lib/randomId";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import z from "zod/v4";

const godGroupRouter = new Hono<AppContext>()

  // グループのデータを取得
  .get(
    "/:id/getGroupData",
    zValidator(
      "param",
      z.object({
        id: genIdSchema.optional(),
      })
    ),
    async (c) => {
      // データ取得
      const id = c.req.valid("param").id || "";

      const result = id.length != 0 ? await db().groups.get(id) : null;

      if (result == null) {
        throw new HTTPException(404, {
          message: "データが見つかりませんでした",
        }); // データが見つからなかった場合は空オブジェクトを返す
      } else {
        return c.json(result);
      }
    }
  )

  .get(
    "/getAllGroups",
    zValidator(
      "query",
      z.object({ page: z.string().optional().default("1").transform(Number) })
    ),
    async (c) => {
      const page = c.req.valid("query").page || 1;
      const pageSize = 50;
      const offset = (page - 1) * pageSize;
      const groups = await db().groups.lis([], pageSize, offset);
      return c.json(groups);
    }
  )

  //グループを削除
  .delete(
    "/:id/deleteGroupData",
    zValidator(
      "param",
      z.object({
        id: genIdSchema,
      })
    ),
    async (c) => {
      const id = c.req.valid("param").id;
      await db().groups.del(id);
      return c.json({ message: "グループを削除しました" });
    }
  )

  // グループのデータ更新
  .post(
    "/:id/setGroupData",

    zValidator(
      "param",
      z.object({
        id: genIdSchema,
      })
    ),
    zValidator(
      "json",
      z.object({
        ...GroupRecordSchema.shape,
      })
    ),
    async (c) => {
      const id = c.req.valid("param").id;
      const data = c.req.valid("json");
      await db().groups.set(id, data);
      return c.json({ message: "God routes are operational." });
    }
  );

export default godGroupRouter;
