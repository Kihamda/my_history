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

const ymdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid format: expected YYYY-MM-DD",
  })
  .refine(
    (v) => {
      const [y, m, d] = v.split("-").map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      return (
        date.getUTCFullYear() === y &&
        date.getUTCMonth() + 1 === m &&
        date.getUTCDate() === d
      );
    },
    { message: "Invalid calendar date" }
  );
export type YMDType = z.infer<typeof ymdSchema>;

const Detail = z.object({
  achievedDate: ymdSchema.nullable(),
  done: z.boolean(),
});

const ScoutPersonalSchema = z.object({
  name: z.string(),
  scoutId: z.string(),
  birthDate: ymdSchema,
  joinedDate: ymdSchema,
  belongGroupId: z.string(),
  currentUnitId: CurrentUnitId,
  memo: z.string(),
  declare: z.object({
    date: ymdSchema,
    place: z.string(),
    done: z.boolean(),
  }),
  religion: z.object({
    date: ymdSchema,
    type: z.string(),
    done: z.boolean(),
  }),
  faith: z.object({
    date: ymdSchema,
    done: z.boolean(),
  }),
});

const ScoutUnitWorkSchema = z.object({
  name: z.string(),
  begin: ymdSchema,
  end: ymdSchema.nullable(),
});

const ScoutUnitGradeSchema = z.object({
  uniqueId: z.string(),
  completedDate: ymdSchema,
  completed: z.boolean(),
  details: z
    .array(Detail)
    .nullable()
    .transform((v) => v ?? []),
});

const ScoutUnitDataSchema = z.object({
  experienced: z.boolean(),
  joinedDate: ymdSchema,
  work: z
    .array(ScoutUnitWorkSchema)
    .nullable()
    .transform((v) => v ?? []),
  grade: z
    .array(ScoutUnitGradeSchema)
    .nullable()
    .transform((v) => v ?? []),
});

const ScoutGinoshoSchema = z.object({
  uniqueId: z.string(),
  certBy: z.string(),
  achievedDate: ymdSchema.nullable(),
  details: z
    .array(Detail)
    .nullable()
    .transform((v) => v ?? []),
});

const ScoutEventSchema = z.object({
  name: z.string(),
  type: z.enum(["camp", "volunteer", "training", "overseas", "award", "other"]),
  startDate: ymdSchema,
  endDate: ymdSchema,
  description: z.string(),
});

export const ScoutRecordSchema = z.object({
  authedIds: z
    .array(z.string())
    .nullable()
    .transform((v) => v ?? []),
  personal: ScoutPersonalSchema,
  unit: z.object({
    bvs: ScoutUnitDataSchema,
    cs: ScoutUnitDataSchema,
    bs: ScoutUnitDataSchema,
    vs: ScoutUnitDataSchema,
    rs: ScoutUnitDataSchema,
  }),
  ginosho: z
    .array(ScoutGinoshoSchema)
    .nullable()
    .transform((v) => v ?? []),
  event: z
    .array(ScoutEventSchema)
    .nullable()
    .transform((v) => v ?? []),
  last_Edited: ymdSchema,
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
  status: z.enum(["active", "inactive", "archived"]),
  members: z.array(GroupMemberSchema),
});

export type GroupRecordSchemaType = z.infer<typeof GroupRecordSchema>;
export type GroupMemberSchemaType = z.infer<typeof GroupMemberSchema>;
export { GroupMemberSchema };
