import { z } from "zod/v4";
import { GroupRoleSchema, ShareRoleSchema, UnitIdWithOb } from "../scoutGroup";

// ========================================
// GroupRole付きID型定義
// ========================================

export const IdWithGroupRoleString = z.string().refine(
  (val) => {
    const parts = val.split(";");
    if (parts.length !== 2) return false;
    const [role, gid] = parts;

    // Roleが定義済みのものであること
    if (!GroupRoleSchema.safeParse(role).success) return false;

    // GIDが空でないこと
    if (gid.length === 0) return false;

    // GIDにセミコロンが含まれていないこと
    if (gid.includes(";")) return false;

    // 再チェック
    return (
      GroupRoleSchema.safeParse(role).success &&
      gid.length > 0 &&
      !gid.includes(";")
    );
  },
  {
    message:
      "Invalid membership format. Expected 'ROLE;groupId' (e.g. 'ADMIN;abc')",
  }
);
export const IdWithShareRoleString = z.string().refine(
  (val) => {
    const parts = val.split(";");
    if (parts.length !== 2) return false;
    const [role, gid] = parts;

    // Roleが定義済みのものであること
    if (!GroupRoleSchema.safeParse(role).success) return false;

    // GIDが空でないこと
    if (gid.length === 0) return false;

    // GIDにセミコロンが含まれていないこと
    if (gid.includes(";")) return false;

    // 再チェック
    return (
      GroupRoleSchema.safeParse(role).success &&
      gid.length > 0 &&
      !gid.includes(";")
    );
  },
  {
    message:
      "Invalid membership format. Expected 'ROLE;groupId' (e.g. 'ADMIN;abc')",
  }
);

export const IdWithGroupRole = z.object({
  role: GroupRoleSchema,
  id: z.string(),
});

export const IdWithShareRole = z.object({
  role: ShareRoleSchema,
  id: z.string(),
});

export const IdWithGroupRoleParser = (val: string) => {
  const [role, gid] = val.split(";");
  return { role: GroupRoleSchema.parse(role), id: gid };
};

export const IdWithShareRoleParser = (val: string) => {
  const [role, gid] = val.split(";");
  return { role: ShareRoleSchema.parse(role), id: gid };
};

export const IdWithGroupRoleStringifier = (
  obj: z.infer<typeof IdWithGroupRole>
) => {
  const role = GroupRoleSchema.parse(obj.role);
  return `${role};${obj.id}`;
};

export const IdWithShareRoleStringifier = (
  obj: z.infer<typeof IdWithShareRole>
) => {
  const role = ShareRoleSchema.parse(obj.role);
  return `${role};${obj.id}`;
};

// ========================================
// Scout Firestore Schema
// ========================================

const ymdSchema = z.string().refine(
  (v) => {
    if (v === "") return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    const [y, m, d] = v.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() + 1 === m &&
      date.getUTCDate() === d
    );
  },
  { message: "Invalid format: expected YYYY-MM-DD or empty string" }
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
  currentUnitId: UnitIdWithOb,
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
  belongGroupId: z.string(),
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

export const UserAuthSchemaString = z.object({
  /**
   * 所属グループと権限を "ROLE;groupId" 形式で保持
   * 例: ["ADMIN;groupA", "VIEW;groupB"]
   * クエリ時は array-contains-any で検索する
   */
  memberships: z
    .array(IdWithGroupRoleString)
    .max(10)
    .nullable()
    .transform((v) => v ?? []),
  invites: z
    .array(IdWithGroupRoleString)
    .max(10)
    .nullable()
    .transform((v) => v ?? []),
  shares: z
    .array(IdWithShareRoleString)
    .max(10)
    .nullable()
    .transform((v) => v ?? []),
  acceptsInvite: z.boolean(),
  isGod: z.boolean().default(false),
});

export const UserAuthSchema = z.object({
  memberships: z.array(IdWithGroupRole).max(10),
  invites: z.array(IdWithGroupRole).max(10),
  shares: z.array(IdWithShareRole).max(10),
  acceptsInvite: z.boolean(),
  isGod: z.boolean().default(false),
});

export const UserProfileSchema = z.object({
  displayName: z.string(),
  statusMessage: z.string(),
});

export const UserRecordSchemaString = z.object({
  email: z.email(),
  auth: UserAuthSchemaString,
  profile: UserProfileSchema,
});

export const UserRecordSchema = UserRecordSchemaString.extend({
  auth: UserAuthSchema,
});

export type UserRecordSchemaStringType = z.infer<typeof UserRecordSchemaString>;
export type UserRecordSchemaType = z.infer<typeof UserRecordSchema>;

// ========================================
// Group Firestore Schema
// ========================================

export const GroupRecordSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type GroupRecordSchemaType = z.infer<typeof GroupRecordSchema>;
