import { getGradeMasterList } from "../master/grade";

export type ScoutUnit = "bvs" | "cs" | "bs" | "vs" | "rs" | "ob";

export const ScoutUnitList: ScoutUnit[] = [
  "bvs", // ビーバースカウト
  "cs", // カブスカウト
  "bs", // ボーイスカウト
  "vs", // ベンチャースカウト
  "rs", // ローバースカウト
  "ob", // OB（卒業生）
];

export const ScoutUnitNameMap: Record<ScoutUnit, string> = {
  bvs: "ビーバー隊",
  cs: "カブ隊",
  bs: "ボーイ隊",
  vs: "ベンチャー隊",
  rs: "ローバー隊",
  ob: "既卒者",
};

export interface UnitExperience {
  id: ScoutUnit;

  name: string;
  // 入隊日
  joinedDate: Date;

  experienced: boolean;
  // 取得したバッジ
  grade: ScoutUnitGrade[];

  works: Work[];
}

export interface ScoutUnitGrade {
  id: string;

  //名前
  name: string;

  // 取得済みか
  has: boolean;

  // 取得した日
  date: Date;
}

export interface Work {
  type: string; // 役職名
  begin: Date; // 開始日
  end: Date; // 終了日
}

export const getOptedUnitDataDefault = async (
  birthday?: Date
): Promise<UnitExperience[]> => {
  if (!birthday) birthday = new Date(new Date().getFullYear() - 10, 0, 1);
  const master = await getGradeMasterList();
  return ScoutUnitList.slice(0, -1).map((unit) => ({
    id: unit,
    joinedDate: new Date(birthday.getFullYear() + 10, 3, 2), // 4月1日入隊をデフォルトに設定
    experienced: false,
    name: ScoutUnitNameMap[unit],
    grade: master
      .map((grade, index) => {
        if (grade.unit == unit) {
          return {
            id: grade.id,
            name: grade.name,
            has: false,
            date: new Date(birthday.getFullYear() + 6 + index, 3, 2),
          };
        } else {
          return null;
        }
      })
      .filter((g) => g !== null),
    works: [],
  }));
};
