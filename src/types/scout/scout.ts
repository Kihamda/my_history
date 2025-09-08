import { ScoutUnit, UnitExperience } from "@/types/scout/scoutUnit";

export interface Scout {
  id: string; // スカウトのユニークID

  personal: ScoutPersonalData;

  unit: UnitExperience[];
}

export interface AuthedUser {
  /** 認証されたユーザーのメールアドレス */
  email: string;

  /** 認証されたユーザーの表示名 */
  displayName?: string;

  role: "edit" | "view";
}

export interface ScoutPersonalData {
  /** スカウトの登録番号 */
  ScoutId: string;

  /** スカウトの所属団体 */
  belongs: string; // 所属団体

  /** スカウトの名前 */
  name: string;

  /** 参加日時 */
  joinedDate: Date;

  /** スカウトのちかいについて */
  declare: {
    isDone: boolean;

    /** ちかいをたてた場所 */
    place: string;

    /** ちかいをたてた日 */
    date: Date;
  };

  /** スカウトの生年月日 */
  birthday: Date;

  ///** スカウトの所属 */
  currentUnit: ScoutUnit;

  /** スカウトのメモ */
  memo: string;

  //** 信仰奨励章＆宗教章 */
  religion: {
    /** 信仰奨励章を持っているか */
    faith: {
      //所有
      has: boolean;

      //日時
      date: Date;
    };

    /** 宗教章を持っているか */
    religion: {
      //所有
      has: boolean;

      //種類
      type: string;

      // 日時
      date: Date;
    };
  };
}

export const ScoutPersonalDataDefault: ScoutPersonalData = {
  ScoutId: "",
  belongs: "",
  name: "",
  joinedDate: new Date(),
  declare: {
    isDone: false,
    place: "",
    date: new Date(),
  },
  birthday: new Date(new Date().getFullYear() - 10, 3, 1),
  currentUnit: "bs",
  memo: "",
  religion: {
    faith: {
      has: false,
      date: new Date(),
    },
    religion: {
      has: false,
      type: "",
      date: new Date(),
    },
  },
};
