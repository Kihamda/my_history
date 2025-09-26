import { Hono } from "hono";
import type { AppBindings } from "../types/bindings";
import type { AppVariables } from "../middleware/auth";
import {
  getGinoshoDetail,
  getGinoshoMasterList,
  getGradeMaster,
  getGradeMasterList,
} from "../repositories/mastersRepository";

// 技能章・進級章などのマスターデータを返すためのルーター。
const mastersRouter = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>()

  .get("/ginosho", async (c) => {
    // 技能章の一覧を取得して配列形式で返す。
    const list = await getGinoshoMasterList(c.env);
    return c.json({ items: list });
  })

  .get("/ginosho/:id", async (c) => {
    const id = c.req.param("id");
    const detail = await getGinoshoDetail(c.env, id);

    if (!detail) {
      // 見つからなかった場合は 404 エラーとエラーコードを返す。
      return c.json(
        {
          error: "GINOSHO_NOT_FOUND",
        },
        404
      );
    }

    return c.json(detail);
  })

  .get("/grade", async (c) => {
    // 進級章の一覧を取得する。
    const list = await getGradeMasterList(c.env);
    return c.json({ items: list });
  })

  .get("/grade/:id", async (c) => {
    const id = c.req.param("id");
    const detail = await getGradeMaster(c.env, id);

    if (!detail) {
      // 対応する進級章が存在しない場合は 404 を返す。
      return c.json(
        {
          error: "GRADE_NOT_FOUND",
        },
        404
      );
    }

    return c.json(detail);
  });

export default mastersRouter;
