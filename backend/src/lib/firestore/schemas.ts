import { z } from "zod";

// ========================================
// 共通型定義
// ========================================

export const CurrentUnitId = z.enum(["bvs", "cs", "bs", "vs", "rs", "ob"]);
export type CurrentUnitIdType = z.infer<typeof CurrentUnitId>;

export const UnitId = z.enum(["bvs", "cs", "bs", "vs", "rs"]);
export type UnitIdType = z.infer<typeof UnitId>;

// ========================================
// Scout Firestore Schema
// ========================================

const Detail = z.object({
  number: z.string(),
  description: z.string(),
  achievedDate: z.date().nullable(),
  done: z.boolean(),
});

const ScoutPersonalSchema = z.object({
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

const ScoutUnitWorkSchema = z.object({
  name: z.string(),
  begin: z.date(),
  end: z.date().nullable(),
});

const ScoutUnitGradeSchema = z.object({
  uniqueId: z.string(),
  joinedDate: z.date(),
  details: z.array(Detail),
});

const ScoutUnitDataSchema = z.object({
  experienced: z.boolean(),
  joinedDate: z.date(),
  work: z.array(ScoutUnitWorkSchema),
  grade: z.array(ScoutUnitGradeSchema),
});

const ScoutGinoshoSchema = z.object({
  uniqueId: z.string(),
  certBy: z.string(),
  achievedDate: z.date().nullable(),
  details: z.array(Detail),
});

const ScoutEventSchema = z.object({
  name: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  description: z.string(),
});

export const ScoutRecordSchema = z.object({
  authedIds: z.array(z.string()),
  personal: ScoutPersonalSchema,
  unit: z.object({
    bvs: ScoutUnitDataSchema,
    cs: ScoutUnitDataSchema,
    bs: ScoutUnitDataSchema,
    vs: ScoutUnitDataSchema,
    rs: ScoutUnitDataSchema,
  }),
  ginosho: z.array(ScoutGinoshoSchema),
  event: z.array(ScoutEventSchema),
  last_Edited: z.date(),
});

export type ScoutRecordSchemaType = z.infer<typeof ScoutRecordSchema>;
export type ScoutPersonalSchemaType = z.infer<typeof ScoutPersonalSchema>;
export type ScoutUnitDataSchemaType = z.infer<typeof ScoutUnitDataSchema>;
export type ScoutUnitWorkSchemaType = z.infer<typeof ScoutUnitWorkSchema>;
export type ScoutUnitGradeSchemaType = z.infer<typeof ScoutUnitGradeSchema>;
export type ScoutGinoshoSchemaType = z.infer<typeof ScoutGinoshoSchema>;
export type ScoutEventSchemaType = z.infer<typeof ScoutEventSchema>;

// ========================================
// User Firestore Schema
// ========================================

export const GroupRoleSchema = z.enum(["ADMIN", "EDIT", "VIEW"]);
export type GroupRoleSchemaType = z.infer<typeof GroupRoleSchema>;

export const UserRecordSchema = z.object({
  displayName: z.string(),
  joinedGroupId: z.string().optional(),
  knowGroupId: z.array(z.string()),
});

export type UserRecordSchemaType = z.infer<typeof UserRecordSchema>;

// ========================================
// Group Firestore Schema
// ========================================

const GroupMemberSchema = z.object({
  userEmail: z.string().email(),
  role: GroupRoleSchema,
});

export const GroupRecordSchema = z.object({
  name: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  members: z.array(GroupMemberSchema),
});

export type GroupRecordSchemaType = z.infer<typeof GroupRecordSchema>;
export type GroupMemberSchemaType = z.infer<typeof GroupMemberSchema>;
export { GroupMemberSchema };
