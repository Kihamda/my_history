type Detail = {
  number: string;
  description: string;
  achievedDate: Date;
  done: boolean;
};

export interface Scout {
  id: string;
  personal: ScoutPersonal;
  unit: ScoutUnit[];
  ginosho: ScoutGinosho[];
  event: ScoutEvent[];
}

// 個人情報のデータ これに
export interface ScoutPersonal {
  name: string;
  scoutId: string;
  birthDate: Date;
  joinedDate: Date;
  belongGroupId: string;
  currentUnitId: "bvs" | "cs" | "bs" | "vs" | "rs" | "ob";
  memo: string;
  declare: {
    date: Date;
    place: string;
    done: boolean;
  };
  religion: {
    date: Date;
    type: string;
    done: boolean;
  };
  faith: {
    date: Date;
    done: boolean;
  };
}

export interface ScoutUnit {
  id: string;
  uniqueId: "bvs" | "cs" | "bs" | "vs" | "rs";
  name: string;
  experienced: boolean;
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
  name: string;
  uniqueId: string;
  joinedDate: Date;
  details: Detail[];
}

// 技能章のデータ
export interface ScoutGinosho {
  id: string;
  uniqueId: string;
  name: string;
  requireCert: boolean;
  certBy: string;
  achievedDate: Date;
  details: Detail[];
}

// 行事章のデータ
export interface ScoutEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
}
