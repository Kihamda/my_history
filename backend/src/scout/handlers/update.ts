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

import z from "zod";
import { Context } from "../../apiRotuer";
import { ScoutRecordSchema } from "../../lib/firestore/schemas";
import { updateScoutWithAuth } from "../services/scoutService";
/**
 * スカウト更新リクエストのバリデーションスキーマ
 *
 * ScoutRecordSchemaの全フィールドを部分的に更新可能
 * 提供されたフィールドのみが更新される
 */
export const updateScoutSchema = z.object({
  data: ScoutRecordSchema.partial(),
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
  c: Context
): Promise<{ message: string }> => {
  // サービス層で権限チェックと更新処理を実行
  await updateScoutWithAuth(c, id, scout.data);

  // 成功レスポンスを返却
  return {
    message: "Scout updated successfully",
  };
};
