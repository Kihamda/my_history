export type ScoutUnit = "bvs" | "cs" | "bs" | "vs" | "rs";

export const ScoutUnitList: ScoutUnit[] = [
  "bvs", // ビーバースカウト
  "cs", // カブスカウト
  "bs", // ボーイスカウト
  "vs", // ヴァイキングスカウト
  "rs", // ローバースカウト
];

export const ScoutUnitNameMap: Record<ScoutUnit, string> = {
  bvs: "ビーバー隊",
  cs: "カブ隊",
  bs: "ボーイ隊",
  vs: "ベンチャー隊",
  rs: "ローバー隊",
};
