import { z } from "zod/v4";

export type ScoutUnit = keyof typeof ScoutUnitNameMap;
export const ScoutUnitNameMap = {
  bvs: "ビーバー隊",
  cs: "カブ隊",
  bs: "ボーイ隊",
  vs: "ベンチャー隊",
  rs: "ローバー隊",
  ob: "既卒者",
};

// グループによるrole管理
export const groupRoles = ["ADMIN", "EDIT", "VIEW"] as const;
export const GroupRoleSchema = z.enum(groupRoles);
export type GroupRoleSchemaType = z.infer<typeof GroupRoleSchema>;

// 各スカウトごとの共有のrole
export const shareRoles = ["EDIT", "VIEW"] as const;
export const ShareRoleSchema = z.enum(shareRoles);
export type ShareRoleSchemaType = z.infer<typeof ShareRoleSchema>;

export const UnitId = z.enum(["bvs", "cs", "bs", "vs", "rs"]);
export type UnitIdType = z.infer<typeof UnitId>;
