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

import type { Context } from "../../apiRotuer";
import { db } from "../../lib/firestore/firestore";
/**
 * スカウト更新リクエストのバリデーションスキーマ
 *
 * ScoutRecordSchemaの全フィールドを部分的に更新可能
 * 提供されたフィールドのみが更新される
 */

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
export const transferScout = async (
  id: string,
  targetGroupId: string,
  c: Context
): Promise<{ message: string }> => {
  // 過去のデータを参照
  const existingScout = await db().scouts.get(id);
  if (!existingScout) {
    throw new Error("Scout not found");
  }

  // 認可処理
  if (!c.var.user.fn.isInRoleOnGroup(existingScout.belongGroupId, ["ADMIN"])) {
    throw new Error("You do not have permission to update this scout");
  }

  // 実処理
  await db().scouts.set(id, {
    ...existingScout,
    belongGroupId: targetGroupId,
    last_Edited: new Date().toISOString().split("T")[0],
  });

  // 成功レスポンスを返却
  return {
    message: "Scout transferred successfully",
  };
};
