export interface Scout {
  id: string;
  personal: ScoutPersonal;
  unit: ScoutUnit[];
  ginosho;
  event;
}

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
  level: number;
  joinedDate: Date;
}

// 技能章のデータ
export interface ScoutGinosho {
  id: string;
  uniqueId: string;
  name: string;
}
