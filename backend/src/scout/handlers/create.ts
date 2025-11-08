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
import { ScoutRecordSchemaType } from "../../lib/firestore/schemas";
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
  // 初期スカウトデータを構築

  // 学年計算用の基準生年月日を設定(4月1日基準)
  const birthDate =
    new Date(data.birthDate).getMonth() < 4
      ? new Date(data.birthDate).getFullYear() - 1
      : new Date(data.birthDate).getFullYear();

  const ageMap: string[] = [];
  for (let i = 0; i < 30; i++) {
    ageMap.push(`${birthDate + i}-04-01`);
  }

  const age = birthDate - new Date().getFullYear();

  const newScout: ScoutRecordSchemaType = {
    // 作成者をアクセス許可ユーザーに追加
    authedIds: [],

    // 個人情報
    personal: {
      name: data.name,
      scoutId: data.scoutId,
      birthDate: data.birthDate,
      joinedDate: ageMap[10],
      belongGroupId: data.belongGroupId,
      currentUnitId: (() => {
        if (age < 8) {
          return "bvs";
        } else if (age < 11) {
          return "cs";
        } else if (age < 14) {
          return "bs";
        } else if (age < 17) {
          return "vs";
        } else if (age < 20) {
          return "rs";
        } else {
          return "ob";
        }
      })(),
      memo: "",

      // ちかい・やくそく(未実施)
      declare: {
        date: ageMap[10],
        place: "",
        done: false,
      },

      // 信仰奨励章(未実施)
      religion: {
        date: ageMap[10],
        type: "",
        done: false,
      },

      // 富士スカウト章/菊スカウト章(未実施)
      faith: {
        date: ageMap[10],
        done: false,
      },
    },

    // 各隊の活動履歴(全て未経験で初期化)
    unit: {
      bvs: { experienced: false, joinedDate: ageMap[10], work: [], grade: [] },
      cs: { experienced: false, joinedDate: ageMap[10], work: [], grade: [] },
      bs: { experienced: false, joinedDate: ageMap[10], work: [], grade: [] },
      vs: { experienced: false, joinedDate: ageMap[10], work: [], grade: [] },
      rs: { experienced: false, joinedDate: ageMap[10], work: [], grade: [] },
    },

    // 技能章リスト(空)
    ginosho: [],

    // 行事章リスト(空)
    event: [],

    // 最終編集日時
    last_Edited: new Date().toISOString().split("T")[0],
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
