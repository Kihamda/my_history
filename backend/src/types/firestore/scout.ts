type Detail = Date | null;

// 個人情報のデータ これに
export interface FirestoreScout {
  name: string;
  scoutId: string;
  birthDate: Date;
  joinedDate: Date;
  belongGroupId: string;
  currentUnitId: "bvs" | "cs" | "bs" | "vs" | "rs" | "ob";
  memo: string;
  declare: {
    date: Date | null;
    place: string;
  };
  religion: {
    date: Date | null;
    type: string;
  };
  faith: {
    date: Date | null;
  };
}

export interface FirestoreScoutUnit {
  uniqueId: "bvs" | "cs" | "bs" | "vs" | "rs";
  joinedDate: Date;
  work: ScoutUnitWork[];
  grade: ScoutUnitGrade[];
}

export interface ScoutUnitWork {
  name: string;
  begin: Date;
  end?: Date;
}

export interface ScoutUnitGrade {
  uniqueId: string;
  joinedDate: Date;
  details: Detail[];
}

// 技能章のデータ
export interface ScoutGinosho {
  uniqueId: string;
  certBy: string;
  achievedDate: Date | null;
  details: Detail[];
}

// 行事章のデータ
export interface ScoutEvent {
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
}
