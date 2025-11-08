import { z } from "zod";
import { CurrentUnitId } from "../../lib/firestore/schemas";

/**
 * @fileoverview Scout検索API型定義
 *
 * このファイルの責務:
 * - 検索リクエストのスキーマ定義
 * - 検索結果レスポンスのスキーマ定義
 *
 * 注意:
 * - 検索結果は必要最小限のフィールドのみを返す(パフォーマンス最適化)
 * - 完全なスカウトデータが必要な場合はGET /scout/:idを使用
 */

/**
 * スカウト検索リクエストスキーマ
 *
 * すべてのフィールドはオプション
 * 複数の条件でAND検索が実行される
 */
export const SearchRequest = z.object({
  name: z.string().default(""),
  scoutId: z.string().default(""),
  currentUnit: z.array(CurrentUnitId).default([]),
  page: z.coerce.number().min(1).default(1),
});

export type SearchRequestType = z.infer<typeof SearchRequest>;

/**
 * 検索結果スキーマ
 *
 * リスト表示に必要な最小限の情報のみ
 * - id: ドキュメントID(詳細取得時に使用)
 * - name: スカウト名
 * - scoutId: スカウトID
 * - currentUnitId: 現在の所属隊ID
 * - currentUnitName: 現在の所属隊名(日本語)
 *
 * 詳細データが必要な場合はGET /scout/:idで取得
 */
export const SearchResult = z.object({
  id: z.string(),
  name: z.string(),
  scoutId: z.string(),
  currentUnitId: CurrentUnitId,
  currentUnitName: z.string(),
});

export type SearchResultType = z.infer<typeof SearchResult>;
