import everyYearAprilFirst from "@/tools/date/everyYearAprilFirst";
import { Scout } from "@/types/scout/scout";
import { UnitExperience } from "@/types/scout/scoutUnit";
/**
 * スカウトの誕生日から入団日時やちかいを立てた日などを推測する関数。
 * 誕生日が設定されている場合、入団日時は誕生日から10年後の4月1日と仮定し、
 * ちかいを立てた日も同じ日に設定する。
 *
 * @param scoutData - スカウトのデータ
 * @returns 推測された日付を含むスカウトデータ
 */
const guessDates = (scoutData: Scout): Scout => {
  // 誕生日から他の日付を推測する処理をここに追加

  if (!scoutData.personal.birthday) {
    return scoutData; // 誕生日が設定されていない場合はそのまま返す
  }
  const ls = everyYearAprilFirst(scoutData.personal.birthday);

  const birthday = scoutData.personal.birthday;
  if (birthday) {
    const optedUnit: UnitExperience = {
      bvs: {
        experienced: false,
        joinedDate: ls[0],
        grade: {
          beaver: { has: false, date: ls[0] },
          bigbeaver: { has: false, date: ls[1] },
        },
        works: [],
      },
      cs: {
        experienced: false,
        joinedDate: ls[2],
        grade: {
          rabbit: { has: false, date: ls[2] },
          deer: { has: false, date: ls[3] },
          bear: { has: false, date: ls[4] },
        },
        works: [],
      },
      bs: {
        experienced: false,
        joinedDate: ls[5],
        grade: {
          beginner: { has: false, date: ls[5] },
          second: { has: false, date: ls[6] },
          first: { has: false, date: ls[7] },
          mum: { has: false, date: ls[8] },
        },
        works: [],
      },
      vs: {
        experienced: false,
        joinedDate: ls[9],
        grade: {
          venture: { has: false, date: ls[9] },
          falcon: { has: false, date: ls[10] },
          fuji: { has: false, date: ls[11] },
        },
        works: [],
      },
      rs: {
        experienced: false,
        joinedDate: ls[12],
        works: [],
      },
    };

    return {
      ...scoutData,
      personal: {
        ...scoutData.personal,
        joinedDate: ls[3], // 誕生日から10年後の4月1日を入団日時とする
        declare: {
          ...scoutData.personal.declare,
          date: ls[5], // ちかいを立てた日はBSの4月1日とする
        },
        religion: {
          ...scoutData.personal.religion,
          faith: {
            ...scoutData.personal.religion.faith,
            date: ls[7], // 信仰奨励章の日付もVS寸前に設定
          },
          religion: {
            ...scoutData.personal.religion.religion,
            date: ls[7], // 法の章の日付もVS寸前に設定
          },
        },
      },
      unit: optedUnit,
    };
  }
  return scoutData;
};

export default guessDates;
