/**
 * @fileoverview スカウト削除ハンドラー
 *
 * このファイルの責務:
 * - スカウト削除リクエストの処理
 * - サービス層への処理委譲
 * - 認証・認可チェック(ADMIN権限必須)はサービス層で実施
 *
 * @module scout/handlers/delete
 */

import { Context } from "../../apiRotuer";
import { deleteScoutWithAuth } from "../services/scoutService";
/**
 * スカウトデータを削除する
 *
 * 処理内容:
 * 1. サービス層で削除処理を実行
 *    - 既存データの存在確認
 *    - 削除権限チェック(ADMIN権限必須)
 *    - Firestoreからデータを削除
 * 2. 成功メッセージを返却
 *
 * 注意:
 * - この操作にはADMIN権限が必要
 * - 削除されたデータは復元できない
 *
 * @param id - スカウトID
 * @param c - Honoコンテキスト
 * @returns 成功メッセージ
 * @throws {HTTPException} サービス層でエラーが発生した場合
 */
export const deleteScout = async (
  id: string,
  c: Context
): Promise<{ message: string }> => {
  // サービス層で権限チェック(ADMIN必須)と削除処理を実行
  await deleteScoutWithAuth(c, id);

  // 成功レスポンスを返却
  return {
    message: "Scout deleted successfully",
  };
};
