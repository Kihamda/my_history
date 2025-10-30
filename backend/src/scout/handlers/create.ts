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

import z from "zod";
import { Context } from "../../apiRotuer";
import {
  CurrentUnitId,
  ScoutRecordSchemaType,
} from "../../lib/firestore/schemas";
import { generateRandomId } from "../../lib/randomId";
import { createScoutWithAuth } from "../services/scoutService";
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
  birthDate: z.coerce.date(),
  joinedDate: z.coerce.date(),
  belongGroupId: z.string().min(1).max(100),
  currentUnitId: CurrentUnitId,
  memo: z.string().max(500).default(""),
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
  // 初期スカウトデータを構築
  const newScout: ScoutRecordSchemaType = {
    // 作成者をアクセス許可ユーザーに追加
    authedIds: [c.var.authToken.uid],

    // 個人情報
    personal: {
      name: data.name,
      scoutId: data.scoutId,
      birthDate: data.birthDate,
      joinedDate: data.joinedDate,
      belongGroupId: data.belongGroupId,
      currentUnitId: data.currentUnitId,
      memo: data.memo,

      // ちかい・やくそく(未実施)
      declare: {
        date: null,
        place: "",
        done: false,
      },

      // 信仰奨励章(未実施)
      religion: {
        date: null,
        type: "",
        done: false,
      },

      // 富士スカウト章/菊スカウト章(未実施)
      faith: {
        date: null,
        done: false,
      },
    },

    // 各隊の活動履歴(全て未経験で初期化)
    unit: {
      bvs: { experienced: false, joinedDate: new Date(0), work: [], grade: [] },
      cs: { experienced: false, joinedDate: new Date(0), work: [], grade: [] },
      bs: { experienced: false, joinedDate: new Date(0), work: [], grade: [] },
      vs: { experienced: false, joinedDate: new Date(0), work: [], grade: [] },
      rs: { experienced: false, joinedDate: new Date(0), work: [], grade: [] },
    },

    // 技能章リスト(空)
    ginosho: [],

    // 行事章リスト(空)
    event: [],

    // 最終編集日時
    last_Edited: new Date(),
  };

  // ランダムなスカウトIDを生成(30文字)
  const id = generateRandomId(30);

  // サービス層で権限チェックとFirestore操作を実行
  await createScoutWithAuth(c, id, newScout);

  // 成功レスポンスを返却
  return {
    id,
    message: "Scout created successfully",
  };
};
