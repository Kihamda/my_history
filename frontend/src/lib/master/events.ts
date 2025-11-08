import type { ScoutData } from "../api/apiTypes";

export type ScoutEventType = ScoutData["event"][number]["type"];

export const ScoutEventTypeMap: {
  [key in ScoutEventType]: string;
} = {
  camp: "キャンプ",
  volunteer: "奉仕活動",
  training: "大会・訓練",
  overseas: "海外派遣",
  award: "表彰",
  other: "その他",
};
