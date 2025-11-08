import { z } from "zod";
import { GroupRoleSchema } from "../../lib/firestore/schemas";

/**
 * @fileoverview Group API型定義
 *
 * このファイルの責務:
 * - FirestoreスキーマをAPI型として再エクスポート
 *
 * 注意:
 * - Group APIはFirestoreのGroupRecordSchemaをそのまま使用
 * - カスタムレスポンス型は不要(データ構造の統一のため)
 */

/**
 * グループロール型の再エクスポート
 * リクエストバリデーション用
 */
export const GroupRole = GroupRoleSchema;
export type GroupRoleType = z.infer<typeof GroupRole>;

/**
 * FirestoreスキーマをAPI型として再エクスポート
 *
 * APIレスポンスとリクエストボディはFirestoreの構造と完全に一致
 */
export {
  GroupRecordSchema,
  GroupMemberSchema,
} from "../../lib/firestore/schemas";

export type {
  GroupRecordSchemaType,
  GroupMemberSchemaType,
} from "../../lib/firestore/schemas";
