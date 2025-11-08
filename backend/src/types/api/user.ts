import { GroupRoleSchema } from "../../lib/firestore/schemas";
import { z } from "zod";

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
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  joinedGroup: z
    .object({
      id: z.string(),
      name: z.string(),
      role: GroupRoleSchema,
    })
    .optional(),
  knowGroupId: z.array(z.string()),
  emailVerified: z.boolean(),
});

export type UserProfileType = z.infer<typeof UserProfile>;

/**
 * FirestoreスキーマをAPI型として再エクスポート
 *
 * リクエストボディ(POST/PUT)ではFirestoreの構造を使用
 */
export { UserRecordSchema } from "../../lib/firestore/schemas";
export type { UserRecordSchemaType } from "../../lib/firestore/schemas";
