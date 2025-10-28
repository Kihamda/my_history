import { Hono } from "hono";
import { AppContext } from "../apiRotuer";
import searchScouts from "./search";
import { zValidator } from "@hono/zod-validator";
import { SearchRequest, SearchResultType } from "../types/api/search";
import updateScout, { updateScoutSchema } from "./update";
import { createScout, ScoutCreateSchema } from "./create";
import { getScout } from "./get";

const scoutRouter = new Hono<AppContext>()
  // Scout 一覧を検索する
  .get("/search", zValidator("query", SearchRequest), async (c) => {
    const query = {
      ...c.req.valid("query"),
      groupId: c.var.authToken?.groupId,
    };
    const result: SearchResultType[] = await searchScouts(query, c);

    return c.json(result);
  })

  // Scout 作成
  .post("/create", zValidator("form", ScoutCreateSchema), async (c) => {
    const form = c.req.valid("form");
    const result = await createScout(form, c);

    return c.json(result);
  })

  // Scout 取得
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    // 取得ロジックをここに実装

    const result = await getScout(id, c);
    return c.json(result);
  })

  // Scout 更新
  .put("/:id", zValidator("form", updateScoutSchema), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("form");

    const result = await updateScout(id, data, c);
    return c.json({ message: `Scout with ID ${id} updated successfully` });
  })

  // Scout 削除
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    // 削除ロジック
    const data = (await c.var.db.collection("scouts").doc(id).get()).data();
    if (!data) {
      return c.notFound();
    }

    await c.var.db.collection("scouts").doc(id).delete();
    return c.json({ message: `Scout with ID ${id} deleted successfully` });
  });

export default scoutRouter;
