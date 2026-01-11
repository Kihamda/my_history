import type { Context } from "../../apiRotuer";
import { db } from "../../lib/firestore/firestore";
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
  // 権限チェック(ADMIN必須)と削除処理を実行
  const target = await db().scouts.get(id);

  if (!target) {
    throw new Error("Scout not found");
  }

  const group = c.var.user.auth.memberships;

  const isAdmin = group.find(
    (m) => m.id === target.belongGroupId && m.role === "ADMIN"
  );

  if (!isAdmin) {
    throw new Error("You do not have permission to delete this scout");
  }

  await db().scouts.del(id);

  // 成功レスポンスを返却
  return {
    message: "Scout deleted successfully",
  };
};
