/**
 * @fileoverview スカウトAPI ルーター
 *
 * このファイルの責務:
 * - スカウト関連のHTTPエンドポイントの定義
 * - リクエストのルーティング
 * - バリデーションミドルウェアの適用
 * - ハンドラー関数の呼び出し
 *
 * エンドポイント一覧:
 * - GET  /search - スカウト検索
 * - POST /create - スカウト作成
 * - GET  /:id    - スカウト取得
 * - PUT  /:id    - スカウト更新
 * - DELETE /:id  - スカウト削除
 *
 * @module scout/routes
 */

import { Hono } from "hono";
import type { AppContext } from "../apiRotuer";
import searchScouts, { SearchRequest } from "./handlers/search";
import { zValidator } from "@hono/zod-validator";
import { updateScout, updateScoutSchema } from "./handlers/update";
import { createScout, ScoutCreateSchema } from "./handlers/create";
import { getScout } from "./handlers/get";
import { deleteScout } from "./handlers/delete";
import { z } from "zod/v4";
import { transferScout } from "./handlers/transfer";
import { genIdSchema } from "@b/lib/randomId";

const scoutRouter = new Hono<AppContext>()
  /**
   * GET /search - スカウト検索
   *
   * クエリパラメータ:
   * - name: スカウト名(部分一致)
   * - scoutId: スカウトID(完全一致)
   * - currentUnit: 現在の所属隊(配列)
   * - page: ページ番号(1始まり)
   *
   * レスポンス: SearchResultType[]
   */
  .post("/search", zValidator("json", SearchRequest), async (c) => {
    const query = c.req.valid("json");
    const result = await searchScouts(query, c);
    return c.json(result);
  })

  /**
   * POST /create - スカウト作成
   *
   * リクエストボディ: ScoutCreateSchemaType
   * - name: スカウト名
   * - scoutId: スカウトID
   * - birthDate: 生年月日
   * - joinedDate: 入団日
   * - belongGroupId: 所属グループID
   * - currentUnitId: 現在の所属隊
   * - memo: メモ
   *
   * レスポンス: { id: string, message: string }
   * 権限: グループのEDIT以上
   */
  .post("/create", zValidator("json", ScoutCreateSchema), async (c) => {
    const form = c.req.valid("json");
    const result = await createScout(form, c);
    return c.json(result, 201);
  })

  /**
   * GET /:id - スカウト取得
   *
   * パスパラメータ:
   * - id: スカウトID
   *
   * レスポンス: ScoutRecordSchemaType
   * 権限: グループメンバーまたはauthedIdsに含まれる
   */
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: genIdSchema,
      })
    ),
    async (c) => {
      console.log("Fetched scout:", c);
      const id = c.req.valid("param").id;
      const result = await getScout(id, c);
      return c.json(result);
    }
  )

  /**
   * PUT /:id - スカウト更新
   *
   * パスパラメータ:
   * - id: スカウトID
   *
   * リクエストボディ:
   * - data: ScoutRecordSchema.partial() (部分更新)
   *
   * レスポンス: { message: string }
   * 権限: グループのEDIT以上
   */
  .put(
    "/:id",
    zValidator("param", z.object({ id: genIdSchema })),
    zValidator("json", updateScoutSchema),
    async (c) => {
      const id = c.req.valid("param").id;
      const data = c.req.valid("json");
      const result = await updateScout(id, data, c);
      return c.json(result);
    }
  )

  /**
   * DELETE /:id - スカウト削除
   *
   * パスパラメータ:
   * - id: スカウトID
   *
   * レスポンス: { message: string }
   * 権限: グループのADMINのみ
   */
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: genIdSchema,
      })
    ),
    async (c) => {
      const id = c.req.valid("param").id;
      const result = await deleteScout(id, c);
      return c.json(result);
    }
  )

  // POST /:id/transfer - スカウトのグループ移動
  .post(
    "/:id/transfer",
    zValidator(
      "json",
      z.object({
        targetGroupId: genIdSchema,
      })
    ),
    async (c) => {
      const id = z.string().parse(c.req.param("id"));
      const { targetGroupId } = c.req.valid("json");
      // 移動処理を実行
      await transferScout(id, targetGroupId, c);
      return c.json({ message: "Scout transferred successfully" });
    }
  );

export default scoutRouter;
