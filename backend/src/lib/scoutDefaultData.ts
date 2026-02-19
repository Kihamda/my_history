import type { ScoutRecordSchemaType } from "./firestore/schemas";

const getDefaultScoutData = (data: {
  birthDate: string;
  belongGroupId: string;
  name: string;
  scoutId: string;
}) => {
  // 学年計算用の基準生年月日を設定(4月1日基準)
  const birthDate =
    new Date(data.birthDate).getMonth() < 4
      ? new Date(data.birthDate).getFullYear() - 1
      : new Date(data.birthDate).getFullYear();

  const ageMap: string[] = [];
  for (let i = 0; i < 30; i++) {
    ageMap.push(`${birthDate + i}-04-01`);
  }

  // const age = birthDate - new Date().getFullYear();
  // ↑誰だこのクソコード書いたの。2008年生が-17歳になるぞ。

  const age = new Date().getFullYear() - birthDate;

  const newScout: ScoutRecordSchemaType = {
    // 個人情報
    belongGroupId: data.belongGroupId,
    personal: {
      name: data.name,
      scoutId: data.scoutId,
      birthDate: data.birthDate,
      joinedDate: ageMap[10],
      currentUnitId: (() => {
        if (age <= 8) {
          return "bvs";
        } else if (age <= 11) {
          return "cs";
        } else if (age <= 15) {
          return "bs";
        } else if (age <= 18) {
          return "vs";
        } else if (age <= 24) {
          return "rs";
        } else {
          return "ob";
        }
      })(),
      memo: "",

      // ちかい・やくそく(未実施)
      declare: {
        date: ageMap[12],
        place: "",
        done: false,
      },

      // 信仰奨励章(未実施)
      religion: {
        date: ageMap[15],
        type: "",
        done: false,
      },

      // 富士スカウト章/菊スカウト章(未実施)
      faith: {
        date: ageMap[18],
        done: false,
      },
    },

    // 各隊の活動履歴(全て未経験で初期化)
    unit: {
      bvs: { experienced: false, joinedDate: ageMap[7], work: [], grade: [] },
      cs: { experienced: false, joinedDate: ageMap[9], work: [], grade: [] },
      bs: { experienced: false, joinedDate: ageMap[12], work: [], grade: [] },
      vs: { experienced: false, joinedDate: ageMap[16], work: [], grade: [] },
      rs: { experienced: false, joinedDate: ageMap[19], work: [], grade: [] },
    },

    // 技能章リスト(空)
    ginosho: [],

    // 行事章リスト(空)
    event: [],

    // 最終編集日時
    last_Edited: new Date().toISOString().split("T")[0],
  };

  return newScout;
};

export default getDefaultScoutData;
