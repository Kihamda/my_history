/**
 * @fileoverview グループ操作のビジネスロジック層
 *
 * このファイルの責務:
 * - グループデータの取得・作成・更新・削除のビジネスロジック
 * - メンバー管理(追加・削除・ロール変更)のビジネスロジック
 * - 権限チェックとFirestore操作の橋渡し
 * - エラーハンドリングとHTTP例外の生成
 *
 * 処理の流れ:
 * 1. 権限チェック層で権限を検証
 * 2. ビジネスルールを適用
 * 3. Firestore操作層でデータを操作
 *
 * @module group/services
 */

import { HTTPException } from "hono/http-exception";
import { Context } from "../../apiRotuer";
import {
  getGroupById,
  createGroupRecord,
  updateGroupRecord,
  deleteGroupRecord,
} from "../../lib/firestore/operations/group";
import { updateUserRecord } from "../../lib/firestore/operations/user";
import {
  GroupRecordSchemaType,
  GroupMemberSchemaType,
} from "../../lib/firestore/schemas";
import {
  isGroupAdmin,
  isGroupMember,
  canUpdateGroup,
  canDeleteGroup,
  canManageGroupMembers,
} from "../permissions/groupPermissions";

/**
 * グループデータを取得(認証・認可付き)
 *
 * 処理内容:
 * 1. Firestoreからグループデータを取得
 * 2. データの存在確認
 * 3. メンバーシップの検証
 * 4. データを返却
 *
 * @param c - Honoコンテキスト
 * @param id - グループID
 * @returns グループデータ
 * @throws {HTTPException} 404 - グループが見つからない
 * @throws {HTTPException} 403 - メンバーでない
 */
export const getGroupWithAuth = async (
  c: Context,
  id: string
): Promise<GroupRecordSchemaType> => {
  // Firestoreからグループデータを取得
  const group = await getGroupById(c.var.db, id);

  // データの存在確認
  if (!group) {
    throw new HTTPException(404, { message: "Group not found" });
  }

  // メンバーシップの検証
  const isMember = await isGroupMember(c, id);
  if (!isMember) {
    throw new HTTPException(403, {
      message: "You do not have permission to access this group",
    });
  }

  return group;
};

/**
 * グループを作成(認証済み)
 *
 * 処理内容:
 * 1. 作成者を管理者として追加
 * 2. Firestoreにグループデータを作成
 * 3. ユーザーの所属グループIDを更新
 *
 * @param c - Honoコンテキスト
 * @param id - 新規グループID
 * @param data - グループデータ(メンバー情報は自動設定)
 */
export const createGroup = async (
  c: Context,
  id: string,
  data: Omit<GroupRecordSchemaType, "members">
): Promise<void> => {
  const token = c.var.authToken;

  // 作成者を管理者として自動追加
  const groupData: GroupRecordSchemaType = {
    ...data,
    members: [
      {
        userEmail: token.email || "",
        role: "ADMIN",
      },
    ],
  };

  // Firestoreにグループデータを作成
  await createGroupRecord(c.var.db, id, groupData);

  // ユーザーの所属グループIDを更新
  await updateUserRecord(c.var.db, token.uid, {
    joinedGroupId: id,
  });
};

/**
 * グループデータを更新(認証・認可付き)
 *
 * 処理内容:
 * 1. 更新権限の検証(ADMIN権限必須)
 * 2. Firestoreのグループデータを更新
 *
 * @param c - Honoコンテキスト
 * @param id - グループID
 * @param data - 更新データ(部分更新可能)
 * @throws {HTTPException} 403 - ADMIN権限がない
 */
export const updateGroupWithAuth = async (
  c: Context,
  id: string,
  data: Partial<GroupRecordSchemaType>
): Promise<void> => {
  // 更新権限の検証(ADMIN権限必須)
  const hasPermission = await canUpdateGroup(c, id);
  if (!hasPermission) {
    throw new HTTPException(403, {
      message: "You do not have permission to update this group",
    });
  }

  // Firestoreのグループデータを更新
  await updateGroupRecord(c.var.db, id, data);
};

/**
 * グループを削除(認証・認可付き)
 *
 * 処理内容:
 * 1. 削除権限の検証(ADMIN権限必須)
 * 2. グループデータの取得と存在確認
 * 3. メンバー数の確認(複数メンバーがいる場合は削除不可)
 * 4. Firestoreからグループデータを削除
 *
 * @param c - Honoコンテキスト
 * @param id - グループID
 * @throws {HTTPException} 403 - ADMIN権限がない、または複数メンバーが存在
 * @throws {HTTPException} 404 - グループが見つからない
 */
export const deleteGroupWithAuth = async (
  c: Context,
  id: string
): Promise<void> => {
  // 削除権限の検証(ADMIN権限必須)
  const hasPermission = await canDeleteGroup(c, id);
  if (!hasPermission) {
    throw new HTTPException(403, {
      message: "You do not have permission to delete this group",
    });
  }

  // グループデータの取得と存在確認
  const group = await getGroupById(c.var.db, id);
  if (!group) {
    throw new HTTPException(404, { message: "Group not found" });
  }

  // メンバー数の確認(複数メンバーがいる場合は削除不可)
  if (group.members.length > 1) {
    throw new HTTPException(403, {
      message: "Cannot delete group with multiple members",
    });
  }

  // Firestoreからグループデータを削除
  await deleteGroupRecord(c.var.db, id);
};

/**
 * グループにメンバーを追加(認証・認可付き)
 *
 * 処理内容:
 * 1. メンバー管理権限の検証(ADMIN権限必須)
 * 2. グループデータの取得と存在確認
 * 3. 既存メンバーの重複確認
 * 4. メンバーリストを更新してFirestoreに保存
 *
 * @param c - Honoコンテキスト
 * @param groupId - グループID
 * @param member - 追加するメンバー情報
 * @throws {HTTPException} 403 - ADMIN権限がない
 * @throws {HTTPException} 404 - グループが見つからない
 * @throws {HTTPException} 409 - メンバーが既に存在
 */
export const addGroupMember = async (
  c: Context,
  groupId: string,
  member: GroupMemberSchemaType
): Promise<void> => {
  // メンバー管理権限の検証(ADMIN権限必須)
  const hasPermission = await canManageGroupMembers(c, groupId);
  if (!hasPermission) {
    throw new HTTPException(403, {
      message: "You do not have permission to add members to this group",
    });
  }

  // グループデータの取得と存在確認
  const group = await getGroupById(c.var.db, groupId);
  if (!group) {
    throw new HTTPException(404, { message: "Group not found" });
  }

  // 既存メンバーの重複確認
  const existing = group.members.find((m) => m.userEmail === member.userEmail);
  if (existing) {
    throw new HTTPException(409, { message: "Member already exists" });
  }

  // メンバーリストを更新してFirestoreに保存
  const updatedMembers = [...group.members, member];
  await updateGroupRecord(c.var.db, groupId, { members: updatedMembers });
};

/**
 * グループからメンバーを削除(認証・認可付き)
 *
 * 処理内容:
 * 1. メンバー管理権限の検証(ADMIN権限必須)
 * 2. グループデータの取得と存在確認
 * 3. メンバーリストから対象者を削除
 * 4. 管理者が0人にならないか確認
 * 5. 更新後のメンバーリストをFirestoreに保存
 *
 * @param c - Honoコンテキスト
 * @param groupId - グループID
 * @param userEmail - 削除対象のメンバーのメールアドレス
 * @throws {HTTPException} 403 - ADMIN権限がない、または最後の管理者を削除しようとした
 * @throws {HTTPException} 404 - グループが見つからない
 */
export const removeGroupMember = async (
  c: Context,
  groupId: string,
  userEmail: string
): Promise<void> => {
  // メンバー管理権限の検証(ADMIN権限必須)
  const hasPermission = await canManageGroupMembers(c, groupId);
  if (!hasPermission) {
    throw new HTTPException(403, {
      message: "You do not have permission to remove members from this group",
    });
  }

  // グループデータの取得と存在確認
  const group = await getGroupById(c.var.db, groupId);
  if (!group) {
    throw new HTTPException(404, { message: "Group not found" });
  }

  // メンバーリストから対象者を削除
  const updatedMembers = group.members.filter((m) => m.userEmail !== userEmail);

  // 管理者が0人にならないか確認
  const adminCount = updatedMembers.filter((m) => m.role === "ADMIN").length;
  if (adminCount === 0) {
    throw new HTTPException(403, {
      message: "Cannot remove the last admin from the group",
    });
  }

  // 更新後のメンバーリストをFirestoreに保存
  await updateGroupRecord(c.var.db, groupId, { members: updatedMembers });
};

/**
 * グループメンバーのロールを更新(認証・認可付き)
 *
 * 処理内容:
 * 1. メンバー管理権限の検証(ADMIN権限必須)
 * 2. グループデータの取得と存在確認
 * 3. 対象メンバーの存在確認
 * 4. メンバーのロールを更新
 * 5. 管理者が0人にならないか確認
 * 6. 更新後のメンバーリストをFirestoreに保存
 *
 * @param c - Honoコンテキスト
 * @param groupId - グループID
 * @param userEmail - 更新対象のメンバーのメールアドレス
 * @param role - 新しいロール(ADMIN/EDIT/VIEW)
 * @throws {HTTPException} 403 - ADMIN権限がない、または最後の管理者のロールを変更しようとした
 * @throws {HTTPException} 404 - グループまたはメンバーが見つからない
 */
export const updateMemberRole = async (
  c: Context,
  groupId: string,
  userEmail: string,
  role: "ADMIN" | "EDIT" | "VIEW"
): Promise<void> => {
  // メンバー管理権限の検証(ADMIN権限必須)
  const hasPermission = await canManageGroupMembers(c, groupId);
  if (!hasPermission) {
    throw new HTTPException(403, {
      message:
        "You do not have permission to update member roles in this group",
    });
  }

  // グループデータの取得と存在確認
  const group = await getGroupById(c.var.db, groupId);
  if (!group) {
    throw new HTTPException(404, { message: "Group not found" });
  }

  // 対象メンバーの存在確認
  const memberIndex = group.members.findIndex((m) => m.userEmail === userEmail);
  if (memberIndex === -1) {
    throw new HTTPException(404, { message: "Member not found" });
  }

  // メンバーのロールを更新
  const updatedMembers = [...group.members];
  updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], role };

  // 管理者が0人にならないか確認
  const adminCount = updatedMembers.filter((m) => m.role === "ADMIN").length;
  if (adminCount === 0) {
    throw new HTTPException(403, {
      message: "Cannot remove the last admin from the group",
    });
  }

  // 更新後のメンバーリストをFirestoreに保存
  await updateGroupRecord(c.var.db, groupId, { members: updatedMembers });
};
