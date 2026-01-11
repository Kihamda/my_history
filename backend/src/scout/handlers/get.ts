import { HTTPException } from "hono/http-exception";
import type { Context } from "../../apiRotuer";
import { db } from "../../lib/firestore/firestore";
import type { ScoutRecordSchemaType } from "../../lib/firestore/schemas";
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
  // Firestoreからスカウトデータを取得
  const scout = await db().scouts.get(id);

  if (!scout) {
    throw new HTTPException(404, { message: "Scout not found" });
  }

  // 認可処理
  const { memberships, shares } = c.var.user.auth;

  const hasAccess =
    memberships.find((m) => m.id === scout.belongGroupId) ||
    shares.find((s) => s.id === id);

  if (!hasAccess) {
    throw new HTTPException(403, {
      message: "You do not have permission to access this scout",
    });
  }

  // データの存在確認
  if (!scout) {
    throw new HTTPException(404, { message: "Scout not found" });
  }

  return scout;
};
