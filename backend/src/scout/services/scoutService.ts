/**
 * @fileoverview スカウト操作のビジネスロジック層
 *
 * このファイルの責務:
 * - スカウトデータの取得・作成・更新・削除・検索のビジネスロジック
 * - 権限チェックとFirestore操作の橋渡し
 * - エラーハンドリングとHTTP例外の生成
 *
 * 処理の流れ:
 * 1. 権限チェック層で権限を検証
 * 2. ビジネスルールを適用
 * 3. Firestore操作層でデータを操作
 *
 * @module scout/services
 */

import { HTTPException } from "hono/http-exception";
import { Context } from "../../apiRotuer";
import {
  getScoutById,
  createScoutRecord,
  updateScoutRecord,
  deleteScoutRecord,
  searchScouts as searchScoutsDb,
  ScoutSearchQuery,
} from "../../lib/firestore/operations/scout";
import { getGroupById } from "../../lib/firestore/operations/group";
import { getUserById } from "../../lib/firestore/operations/user";
import { ScoutRecordSchemaType } from "../../lib/firestore/schemas";
import {
  canAccessScout,
  canCreateScoutInGroup,
  canEditScout,
  canDeleteScout,
  canSearchScoutsInGroup,
} from "../permissions/scoutPermissions";

/**
 * スカウトデータを取得(認証・認可付き)
 *
 * 処理内容:
 * 1. Firestoreからスカウトデータを取得
 * 2. データの存在確認
 * 3. アクセス権限の検証
 * 4. データを返却
 *
 * @param c - Honoコンテキスト
 * @param id - スカウトID
 * @returns スカウトデータ
 * @throws {HTTPException} 404 - スカウトが見つからない
 * @throws {HTTPException} 403 - アクセス権限がない
 */
export const getScoutWithAuth = async (
  c: Context,
  id: string
): Promise<ScoutRecordSchemaType> => {
  // Firestoreからスカウトデータを取得
  const scout = await getScoutById(c.var.db, id);

  // データの存在確認
  if (!scout) {
    throw new HTTPException(404, { message: "Scout not found" });
  }

  // アクセス権限の検証
  const hasAccess = await canAccessScout(c, scout);
  if (!hasAccess) {
    throw new HTTPException(403, {
      message: "You do not have permission to access this scout",
    });
  }

  return scout;
};

/**
 * スカウトデータを作成(認証・認可付き)
 *
 * 処理内容:
 * 1. グループへの作成権限を検証
 * 2. Firestoreにスカウトデータを作成
 *
 * @param c - Honoコンテキスト
 * @param id - 新規スカウトID
 * @param data - スカウトデータ
 * @throws {HTTPException} 404 - グループが見つからない
 * @throws {HTTPException} 403 - 作成権限がない
 */
export const createScoutWithAuth = async (
  c: Context,
  id: string,
  data: ScoutRecordSchemaType
): Promise<void> => {
  // グループが存在するか確認
  const group = await getGroupById(c.var.db, data.personal.belongGroupId);
  if (!group) {
    throw new HTTPException(404, { message: "Group not found" });
  }

  // 作成権限の検証
  const hasPermission = await canCreateScoutInGroup(
    c,
    data.personal.belongGroupId
  );
  if (!hasPermission) {
    throw new HTTPException(403, {
      message: "You do not have permission to create scout in this group",
    });
  }

  // Firestoreにスカウトデータを作成
  await createScoutRecord(c.var.db, id, data);
};

/**
 * スカウトデータを更新(認証・認可付き)
 *
 * 処理内容:
 * 1. Firestoreから既存のスカウトデータを取得
 * 2. データの存在確認
 * 3. 編集権限の検証
 * 4. 最終編集日時を自動設定
 * 5. Firestoreのスカウトデータを更新
 *
 * @param c - Honoコンテキスト
 * @param id - スカウトID
 * @param data - 更新するデータ(部分更新可能)
 * @throws {HTTPException} 404 - スカウトが見つからない
 * @throws {HTTPException} 403 - 編集権限がない
 */
export const updateScoutWithAuth = async (
  c: Context,
  id: string,
  data: Partial<ScoutRecordSchemaType>
): Promise<void> => {
  // 既存のスカウトデータを取得
  const scout = await getScoutById(c.var.db, id);

  // データの存在確認
  if (!scout) {
    throw new HTTPException(404, { message: "Scout not found" });
  }

  // 編集権限の検証
  const hasPermission = await canEditScout(c, scout);
  if (!hasPermission) {
    throw new HTTPException(403, {
      message: "You do not have permission to edit this scout",
    });
  }

  // 最終編集日時を自動設定して更新データを準備
  const updateData = {
    ...data,
    last_Edited: new Date().toISOString().split("T")[0],
  };

  // Firestoreのスカウトデータを更新
  await updateScoutRecord(c.var.db, id, updateData);
};

/**
 * スカウトデータを削除(認証・認可付き)
 *
 * 処理内容:
 * 1. Firestoreから既存のスカウトデータを取得
 * 2. データの存在確認
 * 3. 削除権限の検証(ADMIN権限が必要)
 * 4. Firestoreからスカウトデータを削除
 *
 * @param c - Honoコンテキスト
 * @param id - スカウトID
 * @throws {HTTPException} 404 - スカウトが見つからない
 * @throws {HTTPException} 403 - 削除権限がない(ADMIN権限が必要)
 */
export const deleteScoutWithAuth = async (
  c: Context,
  id: string
): Promise<void> => {
  // 既存のスカウトデータを取得
  const scout = await getScoutById(c.var.db, id);

  // データの存在確認
  if (!scout) {
    throw new HTTPException(404, { message: "Scout not found" });
  }

  // 削除権限の検証(ADMIN権限が必要)
  const hasPermission = await canDeleteScout(c, scout);
  if (!hasPermission) {
    throw new HTTPException(403, {
      message: "You do not have permission to delete this scout",
    });
  }

  // Firestoreからスカウトデータを削除
  await deleteScoutRecord(c.var.db, id);
};

/**
 * スカウトデータを検索(認証・認可付き)
 *
 * 処理内容:
 * 1. ユーザーの所属グループを取得
 * 2. グループへの所属確認
 * 3. 検索権限の検証
 * 4. グループ内のスカウトを検索
 * 5. 検索結果を返却
 *
 * @param c - Honoコンテキスト
 * @param query - 検索条件(グループIDは自動設定される)
 * @returns 検索結果のスカウトデータ配列
 * @throws {HTTPException} 404 - ユーザーまたはグループが見つからない
 * @throws {HTTPException} 403 - グループに所属していない
 */
export const searchScoutsWithAuth = async (
  c: Context,
  query: Omit<ScoutSearchQuery, "belongGroupId">
): Promise<ScoutRecordSchemaType[]> => {
  const token = c.var.authToken;

  // ユーザー情報を取得して所属グループを確認
  const user = await getUserById(c.var.db, token.uid);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  if (!user.joinedGroupId) {
    throw new HTTPException(403, { message: "User is not in any group" });
  }

  // グループの存在確認
  const group = await getGroupById(c.var.db, user.joinedGroupId);
  if (!group) {
    throw new HTTPException(404, { message: "Group not found" });
  }

  // 検索権限の検証(グループメンバーであればOK)
  const hasPermission = await canSearchScoutsInGroup(c, user.joinedGroupId);
  if (!hasPermission) {
    throw new HTTPException(403, {
      message: "You are not a member of this group",
    });
  }

  // 検索クエリを構築(自動的にグループIDを設定)
  const searchQuery: ScoutSearchQuery = {
    ...query,
    belongGroupId: user.joinedGroupId,
  };

  // Firestoreでスカウトを検索
  const results = await searchScoutsDb(c.var.db, searchQuery);

  return results;
};
