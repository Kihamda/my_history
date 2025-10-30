/**
 * @fileoverview スカウト操作における権限チェック機能
 *
 * このファイルの責務:
 * - スカウトデータへのアクセス権限の検証
 * - グループメンバーシップに基づく権限判定
 * - ロール(ADMIN/EDIT/VIEW)に応じた操作可否の判定
 *
 * @module scout/permissions
 */

import { Context } from "../../apiRotuer";
import { getGroupById } from "../../lib/firestore/operations/group";
import {
  ScoutRecordSchemaType,
  GroupMemberSchemaType,
} from "../../lib/firestore/schemas";

/**
 * グループメンバーの権限レベル
 * ADMIN: 全ての操作が可能
 * EDIT: 作成・編集が可能
 * VIEW: 閲覧のみ可能
 */
type PermissionLevel = "ADMIN" | "EDIT" | "VIEW";

/**
 * 指定されたグループにおけるユーザーのメンバー情報を取得
 *
 * @param c - Honoコンテキスト(認証トークンとDB接続を含む)
 * @param groupId - 確認対象のグループID
 * @returns メンバー情報、またはメンバーでない場合はnull
 */
const getGroupMembership = async (
  c: Context,
  groupId: string
): Promise<GroupMemberSchemaType | null> => {
  const token = c.var.authToken;
  const group = await getGroupById(c.var.db, groupId);

  if (!group) {
    return null;
  }

  const member = group.members.find((m) => m.userEmail === token.email);
  return member || null;
};

/**
 * ユーザーが指定されたスカウトデータにアクセス可能か確認
 *
 * アクセス可能な条件:
 * 1. スカウトのauthedIdsに含まれている
 * 2. スカウトが所属するグループのメンバーである
 *
 * @param c - Honoコンテキスト
 * @param scout - 確認対象のスカウトデータ
 * @returns アクセス可能な場合true
 */
export const canAccessScout = async (
  c: Context,
  scout: ScoutRecordSchemaType
): Promise<boolean> => {
  const token = c.var.authToken;

  // 条件1: authedIdsに含まれているか確認
  if (scout.authedIds.includes(token.uid)) {
    return true;
  }

  // 条件2: 所属グループのメンバーか確認
  const membership = await getGroupMembership(c, scout.personal.belongGroupId);
  return membership !== null;
};

/**
 * ユーザーが指定されたグループでスカウトを作成可能か確認
 *
 * 作成可能な条件:
 * - グループに所属している
 * - ADMIN または EDIT 権限を持っている
 *
 * @param c - Honoコンテキスト
 * @param groupId - 確認対象のグループID
 * @returns 作成可能な場合true
 */
export const canCreateScoutInGroup = async (
  c: Context,
  groupId: string
): Promise<boolean> => {
  const membership = await getGroupMembership(c, groupId);

  if (!membership) {
    return false;
  }

  // ADMIN または EDIT 権限が必要
  return membership.role === "ADMIN" || membership.role === "EDIT";
};

/**
 * ユーザーが指定されたスカウトデータを編集可能か確認
 *
 * 編集可能な条件:
 * - スカウトが所属するグループのメンバーである
 * - ADMIN または EDIT 権限を持っている
 *
 * @param c - Honoコンテキスト
 * @param scout - 確認対象のスカウトデータ
 * @returns 編集可能な場合true
 */
export const canEditScout = async (
  c: Context,
  scout: ScoutRecordSchemaType
): Promise<boolean> => {
  const membership = await getGroupMembership(c, scout.personal.belongGroupId);

  if (!membership) {
    return false;
  }

  // ADMIN または EDIT 権限が必要
  return membership.role === "ADMIN" || membership.role === "EDIT";
};

/**
 * ユーザーが指定されたスカウトデータを削除可能か確認
 *
 * 削除可能な条件:
 * - スカウトが所属するグループのメンバーである
 * - ADMIN 権限を持っている
 *
 * @param c - Honoコンテキスト
 * @param scout - 確認対象のスカウトデータ
 * @returns 削除可能な場合true
 */
export const canDeleteScout = async (
  c: Context,
  scout: ScoutRecordSchemaType
): Promise<boolean> => {
  const membership = await getGroupMembership(c, scout.personal.belongGroupId);

  if (!membership) {
    return false;
  }

  // ADMIN 権限かEDIT権限が必要
  return membership.role === "ADMIN" || membership.role === "EDIT";
};

/**
 * ユーザーが指定されたグループのスカウトを検索可能か確認
 *
 * 検索可能な条件:
 * - グループのメンバーである(ロールは問わない)
 *
 * @param c - Honoコンテキスト
 * @param groupId - 確認対象のグループID
 * @returns 検索可能な場合true
 */
export const canSearchScoutsInGroup = async (
  c: Context,
  groupId: string
): Promise<boolean> => {
  const membership = await getGroupMembership(c, groupId);
  return membership !== null;
};
