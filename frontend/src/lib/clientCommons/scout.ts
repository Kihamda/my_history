//
export const UnitIdList = ["bvs", "cs", "bs", "vs", "rs"] as const;
export type UnitIdListType = (typeof UnitIdList)[number];

export type ScoutDataUnitIdListType = UnitIdListType | "ob";
export const ScoutUnitNameMap: Record<ScoutDataUnitIdListType, string> = {
  bvs: "ビーバー",
  cs: "カブ",
  bs: "ボーイ",
  vs: "ベンチャー",
  rs: "ローバー",
  ob: "既卒",
} as const;
