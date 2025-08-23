export interface ScoutEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description: string;
  type: ScoutEventType;
}

export type ScoutEventType =
  | "camp"
  | "join_training"
  | "volunteer"
  | "overseas"
  | "honor"
  | "other";

export const ScoutEventTypeMap: { [key in ScoutEventType]: string } = {
  camp: "キャンプ",
  join_training: "訓練・大会参加",
  volunteer: "奉仕活動",
  overseas: "海外派遣",
  honor: "表彰",
  other: "その他",
};
