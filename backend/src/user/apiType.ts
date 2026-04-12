import { z } from "zod/v4";
import { GroupRoleSchema } from "../lib/scoutGroup";
import { genIdSchema } from "@b/lib/randomId";

/**
 * @fileoverview User API型定義
 *
 * このファイルの責務:
 * - ユーザープロファイルAPIレスポンススキーマ定義
 * - FirestoreスキーマをAPI型として再エクスポート
 *
 * 注意:
 * - UserProfileはFirestoreのUserRecordSchemaとは異なる構造
 * - Firebase Authの情報(uid, email, emailVerified)とFirestoreのデータを結合
 * - 所属グループの詳細情報も含む
 */

/**
 * ユーザープロファイルレスポンススキーマ
 *
 * Firebase AuthenticationとFirestoreのデータを結合した完全なプロファイル情報
 *
 * Firebase Authから:
 * - uid: ユーザーID
 * - email: メールアドレス
 * - emailVerified: メール認証状態
 *
 * Firestoreから:
 * - displayName: 表示名
 * - knowGroupId: 既知のグループIDリスト
 * - joinedGroup: 所属グループ詳細(オプション)
 */
export const UserProfile = z.object({
  uid: genIdSchema,
  email: z.email(),
  auth: z.object({
    emailVerified: z.boolean(),
    memberships: z.array(
      z.object({
        id: genIdSchema,
        name: z.string().min(1).max(100),
        role: GroupRoleSchema,
      }),
    ),
    invites: z.array(
      z.object({
        id: genIdSchema,
        name: z.string().min(1).max(100),
        role: GroupRoleSchema,
      }),
    ),
    shares: z.array(
      z.object({
        id: genIdSchema,
        role: z.string(),
      }),
    ),
    isGod: z.boolean(),
  }),
  profile: z.object({
    displayName: z.string().min(2).max(100),
    statusMessage: z.string().max(500),
    acceptsInvite: z.boolean(),
  }),
});

export type UserProfileType = z.infer<typeof UserProfile>;
