import type { AppContext } from "@b/apiRotuer";
import { db } from "@b/lib/firestore/firestore";
import { ScoutRecordSchema } from "@b/lib/firestore/schemas";
import { generateRandomId, genIdSchema } from "@b/lib/randomId";
import { UnitIdWithOb, type UnitIdWithObType } from "@b/lib/scoutGroup";
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
        belongGroupId: genIdSchema.optional(),
        belongCurrentIds: z
          .string()
          .optional()
          .transform(
            (val) =>
              val
                ?.split(",")
                .filter(
                  (z) => UnitIdWithOb.safeParse(z).success ?? [],
                ) as UnitIdWithObType[],
          ),
      }),
    ),
    async (c) => {
      // データ取得
      const id = c.req.valid("query").id || "";

      if (id.length != 0) {
        const result = await db().scouts.get(id);
        if (result == null) {
          return c.json([], 201); // データが見つからなかった場合は空オブジェクトを返す
        } else {
          const resultWithId = { doc_id: id, ...result };
          return c.json([resultWithId]);
        }
      }

      // クエリパラメータによる検索
      let query: ReturnType<typeof db>["scouts"]["lis"] extends (
        query: infer R,
      ) => void
        ? R
        : never = [];

      // belongGroupIdによる検索
      const belongGroupId = c.req.valid("query").belongGroupId || "";
      if (belongGroupId.length != 0) {
        query.push({ field: "belongGroupId", op: "==", value: belongGroupId });
      }

      // sカウトIDによる検索
      const scoutId = c.req.valid("query").scoutId || "";
      if (scoutId.length != 0) {
        query.push({ field: "personal.scoutId", op: "==", value: scoutId });
      }

      // belongCurrentIdsによる検索
      const belongCurrentIds = c.req.valid("query").belongCurrentIds || [];
      if (belongCurrentIds.length != 0) {
        query.push({
          field: "personal.currentUnitId",
          op: "in",
          value: belongCurrentIds,
        });
      }

      const result = await db().scouts.lis(query);
      return c.json(result);
    },
  )

  // スカウトのデータ更新
  .post(
    "/:id/setScoutData",
    zValidator("param", z.object({ id: genIdSchema })),
    zValidator("json", ScoutRecordSchema),
    async (c) => {
      const id =
        c.req.valid("param").id == "new"
          ? generateRandomId()
          : c.req.valid("param").id;
      const data = c.req.valid("json");
      await db().scouts.set(id, data);
      return c.json({ message: "スカウトデータを更新しました" });
    },
  )

  // スカウトのデータ削除
  .delete(
    "/:id/deleteScoutData",
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

export default godScoutRouter;
