/**
 * @fileoverview スカウト取得ハンドラー
 *
 * このファイルの責務:
 * - 単一スカウトデータの取得処理
 * - サービス層への処理委譲
 * - 認証・認可チェックはサービス層で実施
 *
 * @module scout/handlers/get
 */

import { Context } from "../../apiRotuer";
import { ScoutRecordSchemaType } from "../../lib/firestore/schemas";
import { getScoutWithAuth } from "../services/scoutService";
/**
 * スカウトデータを取得する
 *
 * 処理内容:
 * 1. サービス層でスカウトデータを取得
 *    - 存在確認
 *    - アクセス権限チェック
 * 2. スカウトデータを返却
 *
 * @param id - スカウトID
 * @param c - Honoコンテキスト
 * @returns スカウトデータ
 * @throws {HTTPException} サービス層でエラーが発生した場合
 */
export const getScout = async (
  id: string,
  c: Context
): Promise<ScoutRecordSchemaType> => {
  // サービス層で権限チェック済みのスカウトデータを取得
  const scout = await getScoutWithAuth(c, id);
  return scout;
};
