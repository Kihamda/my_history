import { z } from "zod";
import { CurrentUnitId, ScoutRecordSchema } from "../../lib/firestore/schemas";

// APIレスポンス用の型定義
// Firestore内部スキーマとは別にAPIレスポンス用に整形された型

export { CurrentUnitId };

const Detail = z.object({
  number: z.string(),
  description: z.string(),
  achievedDate: z.date(),
  done: z.boolean(),
});

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

// 個人情報のデータ
export const ScoutPersonal = z.object({
  name: z.string(),
  scoutId: z.string(),
  birthDate: z.date(),
  joinedDate: z.date(),
  belongGroupId: z.string(),
  currentUnitId: CurrentUnitId,
  memo: z.string(),
  declare: z.object({
    date: z.date().nullable(),
    place: z.string(),
    done: z.boolean(),
  }),
  religion: z.object({
    date: z.date().nullable(),
    type: z.string(),
    done: z.boolean(),
  }),
  faith: z.object({
    date: z.date().nullable(),
    done: z.boolean(),
  }),
});

export const ScoutUnit = z.object({
  id: z.string(),
  uniqueId: z.enum(["bvs", "cs", "bs", "vs", "rs"]),
  name: z.string(),
  experienced: z.boolean(),
  joinedDate: z.date(),
  work: z.array(z.object({})),
  grade: z.array(z.object({})),
});

export const ScoutUnitWork = z.object({
  name: z.string(),
  begin: z.date(),
  end: z.date().optional(),
});

export const ScoutUnitGrade = z.object({
  name: z.string(),
  uniqueId: z.string(),
  joinedDate: z.date(),
  details: z.array(Detail),
});

// 技能章のデータ
export const ScoutGinosho = z.object({
  id: z.string(),
  uniqueId: z.string(),
  name: z.string(),
  requireCert: z.boolean(),
  certBy: z.string(),
  achievedDate: z.date().nullable(),
  details: z.array(Detail),
});

// 行事章のデータ
export const ScoutEvent = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  description: z.string(),
});

// APIレスポンス用のScout型
export const Scout = z.object({
  id: z.string(),
  personal: ScoutPersonal,
  unit: z.array(ScoutUnit),
  ginosho: z.array(ScoutGinosho),
  event: z.array(ScoutEvent),
});

export type ScoutType = z.infer<typeof Scout>;

// Firestore内部スキーマをそのまま使う場合のエクスポート
export { ScoutRecordSchema } from "../../lib/firestore/schemas";
export type { ScoutRecordSchemaType } from "../../lib/firestore/schemas";
