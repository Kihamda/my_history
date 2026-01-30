/**
 * @fileoverview スカウト作成ハンドラー
 *
 * このファイルの責務:
 * - スカウト作成リクエストの処理
 * - 入力データのバリデーション(Zodスキーマ)
 * - 初期データの構築
 * - サービス層への処理委譲
 *
 * @module scout/handlers/create
 */

import { z } from "zod/v4";
import type { Context } from "../../apiRotuer";
import { generateRandomId } from "../../lib/randomId";
import { db } from "../../lib/firestore/firestore";
import getDefaultScoutData from "@b/lib/scoutDefaultData";
/**
 * スカウト作成リクエストのバリデーションスキーマ
 *
 * 必須フィールド:
 * - name: スカウト名(1-100文字)
 * - scoutId: スカウトID(1-100文字)
 * - birthDate: 生年月日
 * - joinedDate: 入団日
 * - belongGroupId: 所属グループID
 * - currentUnitId: 現在の所属隊
 * - memo: メモ(最大500文字、省略可)
 */
export const ScoutCreateSchema = z.object({
  name: z.string().min(1).max(100),
  scoutId: z.string().min(1).max(100),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" }),
  belongGroupId: z.string().min(1).max(50),
});

export type ScoutCreateSchemaType = z.infer<typeof ScoutCreateSchema>;

/**
 * スカウトを作成する
 *
 * 処理内容:
 * 1. リクエストデータから初期スカウトデータを構築
 * 2. 各隊の初期データを設定
 * 3. ランダムIDを生成
 * 4. サービス層で権限チェックとFirestore操作を実行
 * 5. 作成結果を返却
 *
 * @param data - バリデーション済みのスカウト作成データ
 * @param c - Honoコンテキスト
 * @returns 作成されたスカウトのIDとメッセージ
 */
export const createScout = async (
  data: ScoutCreateSchemaType,
  c: Context
): Promise<{ id: string; message: string }> => {
  const role = c.var.user.fn.isInRoleOnGroup(data.belongGroupId, [
    "ADMIN",
    "EDIT",
  ]);

  if (!role) {
    throw new Error("You do not have permission to create scout in this group");
  }

  // 初期スカウトデータを構築
  const newScout = getDefaultScoutData(data);

  // ランダムなスカウトIDを生成(30文字)
  const id = generateRandomId(30);

  // データベースに保存(サービス層で権限チェックとFirestore操作を実行)
  await db().scouts.set(id, newScout);

  // 成功レスポンスを返却
  return {
    id,
    message: "Scout created successfully",
  };
};
