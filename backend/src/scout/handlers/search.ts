/**
 * @fileoverview スカウト検索ハンドラー
 *
 * このファイルの責務:
 * - スカウト検索リクエストの処理
 * - Firestoreデータをクライアント向けレスポンス形式に変換
 * - サービス層への処理委譲
 * - 認証・認可チェックはサービス層で実施
 *
 * @module scout/handlers/search
 */

import { Context } from "../../apiRotuer";
import { SearchRequestType, SearchResultType } from "../../types/api/search";
import { ScoutUnitNameMap } from "../../types/common/scoutGroup";
import { searchScoutsWithAuth } from "../services/scoutService";
import { ScoutRecordSchemaType } from "../../lib/firestore/schemas";
/**
 * スカウトを検索する
 *
 * 処理内容:
 * 1. 検索クエリを受け取る
 * 2. サービス層で検索を実行
 *    - ユーザーの所属グループを自動設定
 *    - グループメンバーシップ確認
 *    - Firestoreで検索実行
 * 3. 検索結果をクライアント向け形式に変換
 *    - 必要なフィールドのみを抽出
 *    - 隊名を日本語に変換
 * 4. 変換後のデータを返却
 *
 * @param query - 検索条件(名前、スカウトID、所属隊、ページ番号)
 * @param c - Honoコンテキスト
 * @returns 検索結果の配列(簡易版スカウト情報)
 * @throws {HTTPException} サービス層でエラーが発生した場合
 */
const searchScouts = async (
  query: SearchRequestType,
  c: Context
): Promise<SearchResultType[]> => {
  // サービス層で権限チェックと検索処理を実行
  const results = await searchScoutsWithAuth(c, {
    name: query.name || undefined,
    scoutId: query.scoutId || undefined,
    currentUnit: query.currentUnit.length > 0 ? query.currentUnit : undefined,
    page: query.page,
  });

  // Firestoreデータをクライアント向けレスポンス形式に変換
  return results.map((doc: ScoutRecordSchemaType & { id?: string }) => {
    const result: SearchResultType = {
      // FirestoreのドキュメントIDを設定
      id: doc.id || "",

      // 個人情報から必要なフィールドを抽出
      name: doc.personal.name,
      scoutId: doc.personal.scoutId,
      currentUnitId: doc.personal.currentUnitId,

      // 隊IDを日本語名に変換
      currentUnitName: ScoutUnitNameMap[doc.personal.currentUnitId],
    };
    return result;
  });
};

export default searchScouts;
