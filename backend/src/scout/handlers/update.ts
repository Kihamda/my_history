/**
 * @fileoverview スカウト更新ハンドラー
 *
 * このファイルの責務:
 * - スカウト更新リクエストの処理
 * - 入力データのバリデーション
 * - サービス層への処理委譲
 * - 認証・認可チェックはサービス層で実施
 *
 * @module scout/handlers/update
 */

import { z } from "zod/v4";
import type { Context } from "../../apiRotuer";
import { ScoutRecordSchema } from "../../lib/firestore/schemas";
import { db } from "../../lib/firestore/firestore";
import { HTTPException } from "hono/http-exception";
/**
 * スカウト更新リクエストのバリデーションスキーマ
 *
 * ScoutRecordSchemaの全フィールドを部分的に更新可能
 * 提供されたフィールドのみが更新される
 */
export const updateScoutSchema = z.object({
  data: ScoutRecordSchema.omit({ belongGroupId: true }),
});

/**
 * スカウトデータを更新する
 *
 * 処理内容:
 * 1. バリデーション済みデータを受け取る
 * 2. サービス層で更新処理を実行
 *    - 既存データの存在確認
 *    - 編集権限チェック
 *    - 最終編集日時の自動更新
 * 3. 成功メッセージを返却
 *
 * @param id - スカウトID
 * @param scout - 更新データ(部分更新)
 * @param c - Honoコンテキスト
 * @returns 成功メッセージ
 * @throws {HTTPException} サービス層でエラーが発生した場合
 */
export const updateScout = async (
  id: string,
  scout: z.infer<typeof updateScoutSchema>,
  c: Context,
): Promise<{ message: string }> => {
  // 過去のデータを参照
  const existingScout = await db().scouts.get(id);

  if (!existingScout) {
    throw new HTTPException(404, { message: `Scout not found` });
  }

  // 認可処理
  const shares = c.var.user.auth.shares;

  const hasAccess =
    c.var.user.fn.isInRoleOnGroup(existingScout.belongGroupId, [
      "ADMIN",
      "EDIT",
    ]) ||
    shares.find(
      (s) => s.id === existingScout.belongGroupId && s.role == "EDIT",
    );

  if (!hasAccess) {
    throw new HTTPException(403, {
      message: "You do not have permission to update this scout",
    });
  }

  // 実処理
  await db().scouts.set(id, {
    belongGroupId: existingScout.belongGroupId, // 変更不可項目はそのまま保持
    ...scout.data,
    last_Edited: new Date().toISOString().split("T")[0],
  });

  // 成功レスポンスを返却
  return {
    message: "Scout updated successfully",
  };
};
