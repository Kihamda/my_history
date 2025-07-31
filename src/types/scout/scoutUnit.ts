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
  // ビーバースカウト
  bvs: {
    experienced: boolean; // 経験済みかどうか
    joinedDate: Date;
    grade: {
      beaver: {
        has: boolean; // ビーバー
        date: Date; // ビーバーを取得した日
      }; // ビーバー
      bigbeaver: {
        has: boolean; // ビッグビーバー
        date: Date; // ビッグビーバーを取得した日
      }; // ビッグビーバー
    };
  };

  // カブスカウト
  cs: {
    experienced: boolean; // 経験済みかどうか
    joinedDate: Date; // カブスカウト
    grade: {
      rabbit: {
        has: boolean; // ウサギ
        date: Date; // ウサギを取得した日
      }; // ウサギ
      deer: {
        has: boolean; // シカ
        date: Date; // シカを取得した日
      }; // シカ
      bear: {
        has: boolean; // クマ
        date: Date; // クマを取得した日
      }; // クマ
    };
  }; // カブスカウト
  bs: {
    experienced: boolean; // 経験済みかどうか
    joinedDate: Date; // ボーイスカウト
    grade: {
      beginner: {
        has: boolean; // 初級
        date: Date; // 初級を取得した日
      }; // 初級
      second: {
        has: boolean; // セカンド
        date: Date; // セカンドを取得した日
      }; // セカンド
      first: {
        has: boolean; // ファースト
        date: Date; // ファーストを取得した日
      }; // ファースト
      mum: {
        has: boolean; // 菊
        date: Date; // 菊を取得した日
      };
    };
  }; // ボーイスカウト
  vs: {
    experienced: boolean; // 経験済みかどうか
    joinedDate: Date; // ベンチャースカウト
    grade: {
      venture: {
        has: boolean; // 初級
        date: Date; // 初級を取得した日
      }; // 初級
      falcon: {
        has: boolean; // セカンド
        date: Date; // セカンドを取得した日
      }; // セカンド
      fuji: {
        has: boolean; // ファースト
        date: Date; // ファーストを取得した日
      }; // ファースト
    };
  }; // ベンチャースカウト
  rs: {
    experienced: boolean; // 経験済みかどうか
    joinedDate: Date; // ローバースカウト
  }; // ローバースカウト
}
