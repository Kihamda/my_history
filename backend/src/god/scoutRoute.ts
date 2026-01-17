import type { AppContext } from "@b/apiRotuer";
import { db } from "@b/lib/firestore/firestore";
import { ScoutRecordSchema } from "@b/lib/firestore/schemas";
import { genIdSchema } from "@b/lib/randomId";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod/v4";

const godScoutRouter = new Hono<AppContext>()

  // スカウトのデータをクエリして取得
  .get(
    "/getScoutData",
    zValidator(
      "query",
      z.object({
        id: genIdSchema.optional(),
        scoutId: z.string().optional(),
      })
    ),
    async (c) => {
      // データ取得
      const id = c.req.valid("query").id || "";
      const scoutId = c.req.valid("query").scoutId || "";

      // 両方指定された場合は両方で検索して結果を結合して返す
      if (id.length != 0 && scoutId.length != 0) {
        const idMatch = await db().scouts.lis([
          { field: "doc_id", op: "==", value: id },
        ]);
        const scoutIdMatch = await db().scouts.lis([
          { field: "personal.scoutId", op: "==", value: scoutId },
        ]);
        return c.json([...idMatch, ...scoutIdMatch]);
      } else if (id.length != 0) {
        // doc_idで検索
        const result = await db().scouts.lis([
          { field: "doc_id", op: "==", value: id },
        ]);
        return c.json(result);
      } else if (scoutId.length != 0) {
        // scoutIdで検索
        const result = await db().scouts.lis([
          { field: "personal.scoutId", op: "==", value: scoutId },
        ]);
        return c.json(result);
      } else {
        return c.json([]); // 何も指定されなかった場合は空配列を返す
      }
    }
  )

  //

  // スカウトのデータ更新
  .post(
    "/setScoutData",
    zValidator(
      "json",
      z.object({
        doc_id: genIdSchema,
        ...ScoutRecordSchema.shape,
      })
    ),
    async (c) => {
      const id = c.req.valid("json").doc_id;
      const data = c.req.valid("json");
      await db().scouts.set(id, data);
      return c.json({ message: "God routes are operational." });
    }
  );

export default godScoutRouter;
