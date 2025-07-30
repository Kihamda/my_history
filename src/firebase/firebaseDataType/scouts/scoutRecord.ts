import { ScoutUnit } from "@/types/scout/scoutUnit";

export interface ScoutRecord {
  personal: {
    /** スカウトの登録番号 */
    ScoutId: string;

    /** スカウトの名前 */
    name: string;

    /** スカウトのちかいについて */
    declare: {
      /** ちかいをたてた場所 */
      place: string;

      /** ちかいをたてた日 */
      date: Date;
    };

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

    /** スカウトの生年月日 */
    birthday: Date;

    ///** スカウトの所属 */
    currentUnit: ScoutUnit;

    /** スカウトのメモ */
    memo: string;
  };
  bvs: {
    experienced: boolean; // 経験済みかどうか
    joinedDate: Date;
  };
  cs: {
    joinedDate: Date;
    grade: {
      1: Date;
      2: Date;
      3: Date;
    };
    work: {
      chief: {
        begin: Date; //組長
        end: Date; //組長
      };
      assistant: {
        begin: Date; //次長
        end: Date; //次長
      };
    };
  };
  bs: {
    joinedDate: Date;
    grade: {
      1: Date; //初級
      2: Date; //2級
      3: Date; //1級
      4: Date; //菊
    };
    works: Work[];
  };
  vs: {
    joinedDate: Date;
    grade: {
      1: Date; //VS
      2: Date; //はやぶさ
      3: Date; //ふじ
    };
    work: {
      topchief: {
        begin: Date; //隊長
        end: Date; //隊長
      };
      bsleader: {
        begin: Date; //BS隊付
        end: Date; //BS隊付
      };
      csleader: {
        begin: Date; //JL
        end: Date; //JL
      };
    };
  };
}

interface Work {
  type: string; // 役職名
  begin: Date; // 開始日
  end: Date; // 終了日
}

interface AuthedUser {
  /** 認証されたユーザーのメールアドレス */
  email: string;

  /** 認証されたユーザーの表示名 */
  displayName?: string;

  role: "edit" | "view";
}
