/**
 * @fileoverview グループ操作における権限チェック機能
 *
 * このファイルの責務:
 * - グループへのアクセス権限の検証
 * - グループ管理操作(更新・削除・メンバー管理)の権限判定
 * - 管理者権限の検証
 *
 * @module group/permissions
 */

import { Context } from "../../apiRotuer";
import { getGroupById } from "../../lib/firestore/operations/group";
import { GroupMemberSchemaType } from "../../lib/firestore/schemas";

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
 * ユーザーが指定されたグループの管理者か確認
 *
 * @param c - Honoコンテキスト
 * @param groupId - 確認対象のグループID
 * @returns ADMIN権限を持つ場合true
 */
export const isGroupAdmin = async (
  c: Context,
  groupId: string
): Promise<boolean> => {
  const membership = await getGroupMembership(c, groupId);
  return membership?.role === "ADMIN";
};

/**
 * ユーザーが指定されたグループのメンバーか確認
 *
 * @param c - Honoコンテキスト
 * @param groupId - 確認対象のグループID
 * @returns メンバーの場合true(ロールは問わない)
 */
export const isGroupMember = async (
  c: Context,
  groupId: string
): Promise<boolean> => {
  const membership = await getGroupMembership(c, groupId);
  return membership !== null;
};

/**
 * ユーザーがグループを更新可能か確認
 *
 * 更新可能な条件:
 * - ADMIN権限を持っている
 *
 * @param c - Honoコンテキスト
 * @param groupId - 確認対象のグループID
 * @returns 更新可能な場合true
 */
export const canUpdateGroup = async (
  c: Context,
  groupId: string
): Promise<boolean> => {
  return await isGroupAdmin(c, groupId);
};

/**
 * ユーザーがグループを削除可能か確認
 *
 * 削除可能な条件:
 * - ADMIN権限を持っている
 *
 * @param c - Honoコンテキスト
 * @param groupId - 確認対象のグループID
 * @returns 削除可能な場合true
 */
export const canDeleteGroup = async (
  c: Context,
  groupId: string
): Promise<boolean> => {
  return await isGroupAdmin(c, groupId);
};

/**
 * ユーザーがグループメンバーを管理可能か確認
 *
 * 管理可能な条件:
 * - ADMIN権限を持っている
 *
 * @param c - Honoコンテキスト
 * @param groupId - 確認対象のグループID
 * @returns 管理可能な場合true
 */
export const canManageGroupMembers = async (
  c: Context,
  groupId: string
): Promise<boolean> => {
  return await isGroupAdmin(c, groupId);
};
