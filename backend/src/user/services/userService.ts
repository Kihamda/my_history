/**
 * @fileoverview ユーザー操作のビジネスロジック層
 *
 * このファイルの責務:
 * - ユーザーデータの取得・作成・更新・削除のビジネスロジック
 * - ユーザープロファイル情報の構築
 * - Firestore操作層との橋渡し
 * - エラーハンドリングとHTTP例外の生成
 *
 * 処理の流れ:
 * 1. 認証トークンからユーザーIDを取得
 * 2. ビジネスルールを適用
 * 3. Firestore操作層でデータを操作
 *
 * @module user/services
 */

import { HTTPException } from "hono/http-exception";
import { Context } from "../../apiRotuer";
import {
  getUserById,
  createUserRecord,
  updateUserRecord,
  deleteUserRecord,
} from "../../lib/firestore/operations/user";
import { getGroupById } from "../../lib/firestore/operations/group";
import { UserRecordSchemaType } from "../../lib/firestore/schemas";

/**
 * 現在ログイン中のユーザー情報を取得
 *
 * 処理内容:
 * 1. 認証トークンからユーザーIDを取得
 * 2. Firestoreからユーザーデータを取得
 * 3. データの存在確認
 * 4. ユーザーデータを返却
 *
 * @param c - Honoコンテキスト
 * @returns ユーザーデータ
 * @throws {HTTPException} 404 - ユーザーが見つからない
 */
export const getCurrentUser = async (
  c: Context
): Promise<UserRecordSchemaType> => {
  const token = c.var.authToken;

  // Firestoreからユーザーデータを取得
  const user = await getUserById(c.var.db, token.uid);

  // データの存在確認
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return user;
};

/**
 * ユーザー情報を作成(初回登録時のみ)
 *
 * 処理内容:
 * 1. 認証トークンからユーザーIDを取得
 * 2. 既存ユーザーの確認(重複チェック)
 * 3. Firestoreにユーザーデータを作成
 *
 * @param c - Honoコンテキスト
 * @param data - ユーザーデータ
 * @throws {HTTPException} 409 - ユーザーが既に存在する
 */
export const createUser = async (
  c: Context,
  data: UserRecordSchemaType
): Promise<void> => {
  const token = c.var.authToken;

  // 既存ユーザーの確認(重複チェック)
  const existing = await getUserById(c.var.db, token.uid);
  if (existing) {
    throw new HTTPException(409, { message: "User already exists" });
  }

  // Firestoreにユーザーデータを作成
  await createUserRecord(c.var.db, token.uid, data);
};

/**
 * 自分のユーザー情報を更新
 *
 * 処理内容:
 * 1. 認証トークンからユーザーIDを取得
 * 2. 既存ユーザーの存在確認
 * 3. Firestoreのユーザーデータを更新
 *
 * @param c - Honoコンテキスト
 * @param data - 更新データ(部分更新可能)
 * @throws {HTTPException} 404 - ユーザーが見つからない
 */
export const updateCurrentUser = async (
  c: Context,
  data: Partial<UserRecordSchemaType>
): Promise<void> => {
  const token = c.var.authToken;

  // 既存ユーザーの存在確認
  const user = await getUserById(c.var.db, token.uid);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  // Firestoreのユーザーデータを更新
  await updateUserRecord(c.var.db, token.uid, data);
};

/**
 * 自分のユーザー情報を削除
 *
 * 処理内容:
 * 1. 認証トークンからユーザーIDを取得
 * 2. 既存ユーザーの存在確認
 * 3. Firestoreからユーザーデータを削除
 *
 * @param c - Honoコンテキスト
 * @throws {HTTPException} 404 - ユーザーが見つからない
 */
export const deleteCurrentUser = async (c: Context): Promise<void> => {
  const token = c.var.authToken;

  // 既存ユーザーの存在確認
  const user = await getUserById(c.var.db, token.uid);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  // Firestoreからユーザーデータを削除
  await deleteUserRecord(c.var.db, token.uid);
};

/**
 * グループ情報を含む完全なユーザープロファイルを取得
 *
 * 処理内容:
 * 1. 認証トークンからユーザーIDとメールアドレスを取得
 * 2. Firestoreからユーザーデータを取得
 * 3. データの存在確認
 * 4. 所属グループ情報を取得(存在する場合)
 * 5. グループ内でのロール情報を取得
 * 6. クライアント向けプロファイル情報を構築して返却
 *
 * @param c - Honoコンテキスト
 * @returns ユーザープロファイル情報(グループ情報含む)
 * @throws {HTTPException} 404 - ユーザーが見つからない
 */
export const getUserProfile = async (c: Context) => {
  const token = c.var.authToken;

  // Firestoreからユーザーデータを取得
  const user = await getUserById(c.var.db, token.uid);

  // データの存在確認
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  // 所属グループ情報を取得(オプション)
  let groupData = undefined;

  if (user.joinedGroupId) {
    // グループデータを取得
    const group = await getGroupById(c.var.db, user.joinedGroupId);

    if (group) {
      // グループ内でのメンバー情報を取得
      const member = group.members.find((m) => m.userEmail === token.email);

      if (member) {
        // グループ情報を構築
        groupData = {
          id: user.joinedGroupId,
          name: group.name,
          role: member.role,
        };
      }
    }
  }

  // クライアント向けプロファイル情報を構築
  return {
    uid: token.uid,
    email: token.email || "",
    displayName: user.displayName,
    knowGroupId: user.knowGroupId || [],
    joinedGroup: groupData,
    emailVerified: token.email_verified || false,
  };
};
