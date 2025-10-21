import { Hono } from "hono";
import { AppContext } from "../apiRotuer";
import searchScouts from "./search";
import createScout from "./create";
import { zValidator } from "@hono/zod-validator";
import { SearchRequest } from "../types/api/search";
import { Scout, ScoutCreate } from "../types/api/scout";
import z from "zod";

const scoutRouter = new Hono<AppContext>()

  // Scout 一覧を検索する
  .get("/search", zValidator("query", SearchRequest), async (c) => {
    const query = {
      ...c.req.valid("query"),
      groupId: c.var.authToken?.groupId,
    };
    const result = await searchScouts(query, c);

    return result;
  })

  // Scout 作成
  .post("/create", zValidator("form", ScoutCreate), async (c) => {
    const form = c.req.valid("form");
    const result = await createScout(form, c);

    return result;
  })

  // Scout 取得
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    // 取得ロジックをここに実装
  })

  // Scout 更新
  .put("/:id", zValidator("form", Scout), async (c) => {
    const id = c.req.param("id");
    const data = await c.req.json();
    // 更新ロジックをここに実装
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
