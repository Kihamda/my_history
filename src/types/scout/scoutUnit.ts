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
    works: Work[]; // ビーバースカウトの活動記録
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
    works: Work[]; // カブスカウトの活動記録
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
    works: Work[]; // ボーイスカウトの活動記録
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
    works: Work[]; // ベンチャースカウトの活動記録
  }; // ベンチャースカウト
  rs: {
    experienced: boolean; // 経験済みかどうか
    joinedDate: Date; // ローバースカウト
    works: Work[]; // ローバースカウトの活動記録
  }; // ローバースカウト
}

export interface Work {
  type: string; // 役職名
  begin: Date; // 開始日
  end: Date; // 終了日
  memo: string; // メモ
}

export const ScoutUnitDataDefault: UnitExperience = {
  bvs: {
    experienced: false,
    joinedDate: new Date(),
    grade: {
      beaver: {
        has: false,
        date: new Date(),
      },
      bigbeaver: {
        has: false,
        date: new Date(),
      },
    },
    works: [],
  },
  cs: {
    experienced: false,
    joinedDate: new Date(),
    grade: {
      rabbit: {
        has: false,
        date: new Date(),
      },
      deer: {
        has: false,
        date: new Date(),
      },
      bear: {
        has: false,
        date: new Date(),
      },
    },
    works: [],
  },
  bs: {
    experienced: false,
    joinedDate: new Date(),
    grade: {
      beginner: {
        has: false,
        date: new Date(),
      },
      second: {
        has: false,
        date: new Date(),
      },
      first: {
        has: false,
        date: new Date(),
      },
      mum: {
        has: false,
        date: new Date(),
      },
    },
    works: [],
  },
  vs: {
    experienced: false,
    joinedDate: new Date(),
    grade: {
      venture: {
        has: false,
        date: new Date(),
      },
      falcon: {
        has: false,
        date: new Date(),
      },
      fuji: {
        has: false,
        date: new Date(),
      },
    },
    works: [],
  },
  rs: {
    experienced: false,
    joinedDate: new Date(),
    works: [],
  },
};
