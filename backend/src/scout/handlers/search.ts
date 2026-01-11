/**
 * @fileoverview スカウト検索ハンドラー
 *
 * このファイルの責務:
 * - 検索リクエストのバリデーション(Zodスキーマ)
 * - 認可チェック(グループ所属確認)
 * - Firestore検索の実行
 * - クライアント向けレスポンス形式への変換
 */

import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import type { Context } from "../../apiRotuer";
import { ScoutUnitNameMap } from "../../lib/scoutGroup";
import { db } from "../../lib/firestore/firestore";
import {
  CurrentUnitId,
  type ScoutRecordSchemaType,
} from "../../lib/firestore/schemas";

// ========================================
// API Schema
// ========================================

/**
 * スカウト検索リクエストスキーマ
 * - belongGroupId: 省略時はユーザーの所属グループ先頭を使用
 */
export const SearchRequest = z.object({
  name: z.string().default(""),
  scoutId: z.string().default(""),
  currentUnit: z.array(CurrentUnitId).default([]),
  page: z.coerce.number().min(1).default(1),
  belongGroupId: z.string().default(""),
});

export type SearchRequestType = z.infer<typeof SearchRequest>;

export const SearchResult = z.object({
  id: z.string(),
  name: z.string(),
  scoutId: z.string(),
  currentUnitId: CurrentUnitId,
  currentUnitName: z.string(),
});

export type SearchResultType = z.infer<typeof SearchResult>;

// ========================================
// Internal
// ========================================

type ScoutSearchQuery = {
  name?: string;
  scoutId?: string;
  currentUnit?: z.infer<typeof CurrentUnitId>[];
  page: number;
  belongGroupId?: string[];
};

const DEFAULT_LIMIT = 20;

/**
 * スカウトデータを検索(認可付き)
 */
export const searchScoutsWithAuth = async (
  c: Context,
  query: ScoutSearchQuery
): Promise<Array<{ doc_id: string } & ScoutRecordSchemaType>> => {
  const authedGroupId = query.belongGroupId?.filter(
    (id) =>
      c.var.user.auth.memberships.find((m) => m.id === id) ||
      c.var.user.auth.shares.find((s) => s.id === id)
  );

  if (!authedGroupId || authedGroupId.length === 0) {
    throw new HTTPException(403, {
      message: "You do not have permission to search scouts in this group",
    });
  }

  // operator の型定義はトップレベルキーしか許可しないけど
  // Firestore 自体はネストパス指定できるので any で渡す
  const where: any[] = [
    {
      field: "belongGroupId",
      op: "in",
      value: authedGroupId,
    },
  ];

  if (query.name) {
    where.push({ field: "personal.name", op: ">=", value: query.name });
    where.push({
      field: "personal.name",
      op: "<=",
      value: `${query.name}\uf8ff`,
    });
  }

  if (query.scoutId) {
    where.push({
      field: "personal.scoutId",
      op: "==",
      value: query.scoutId,
    });
  }

  if (query.currentUnit && query.currentUnit.length > 0) {
    where.push({
      field: "personal.currentUnitId",
      op: "in",
      value: query.currentUnit,
    });
  }

  const offset = (query.page - 1) * DEFAULT_LIMIT;
  return (await db().scouts.lis(where, DEFAULT_LIMIT, offset)) as any;
};

/**
 * スカウトを検索する(ハンドラー本体)
 */
const searchScouts = async (
  query: SearchRequestType,
  c: Context
): Promise<SearchResultType[]> => {
  const normalizedName = query.name.trim();
  const normalizedScoutId = query.scoutId.trim();

  const results = await searchScoutsWithAuth(c, {
    name: normalizedName.length > 0 ? normalizedName : undefined,
    scoutId: normalizedScoutId.length > 0 ? normalizedScoutId : undefined,
    currentUnit: query.currentUnit.length > 0 ? query.currentUnit : undefined,
    page: query.page,
    belongGroupId: [query.belongGroupId], // 暫定的に要素１の配列で渡す
  });

  return results.map((doc) => ({
    id: doc.doc_id,
    name: doc.personal.name,
    scoutId: doc.personal.scoutId,
    currentUnitId: doc.personal.currentUnitId,
    currentUnitName: ScoutUnitNameMap[doc.personal.currentUnitId],
  }));
};

export default searchScouts;
