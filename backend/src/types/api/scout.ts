import { z } from "zod";
import { CurrentUnitId, ScoutRecordSchema } from "../../lib/firestore/schemas";

/**
 * @fileoverview Scout API型定義
 *
 * このファイルの責務:
 * - Scout作成時のリクエストスキーマ定義
 * - FirestoreスキーマをAPI型として再エクスポート
 *
 * 注意:
 * - APIレスポンスはFirestoreスキーマ(ScoutRecordSchemaType)をそのまま使用
 * - カスタムレスポンス型は定義しない(データ構造の統一のため)
 */

export { CurrentUnitId };

/**
 * スカウト作成リクエストスキーマ
 *
 * 必須項目のみを含む最小限のスキーマ
 * 作成後は完全なScoutRecordSchemaTypeに変換される
 */
export const ScoutCreate = z.object({
  name: z.string().min(1).max(100),
  scoutId: z.string().min(1).max(100),
  birthDate: z.coerce.date(),
  joinedDate: z.coerce.date(),
  belongGroupId: z.string().min(1).max(100),
  currentUnitId: CurrentUnitId,
  memo: z.string().max(500).default(""),
});

export type ScoutCreateType = z.infer<typeof ScoutCreate>;

/**
 * FirestoreスキーマをAPI型として再エクスポート
 *
 * APIレスポンスはFirestoreの構造と完全に一致させる
 * これにより:
 * - フロントエンドとバックエンドでデータ構造が統一される
 * - 型定義の重複が避けられる
 * - データ変換処理が不要になる
 */
export const ScoutUpdateSchema = ScoutRecordSchema.omit({ authedIds: true });

export {
  ScoutPersonalSchemaType,
  ScoutUnitDataSchemaType,
  ScoutUnitWorkSchemaType,
  ScoutUnitGradeSchemaType,
  ScoutGinoshoSchemaType,
  ScoutEventSchemaType,
} from "../../lib/firestore/schemas";

export type { ScoutRecordSchemaType } from "../../lib/firestore/schemas";
