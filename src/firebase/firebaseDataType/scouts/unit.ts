import { ScoutUnit } from "@/types/scout/unit";

export interface UnitExperienceFirestore {
  id: ScoutUnit;
  name: string;
  // 入隊日
  joinedDate: Date;
  experienced: boolean;
}

export interface ScoutUnitGradeFirestore {
  unique: string;
  // 取得済みか
  has: boolean;
  // 取得した日
  date: Date;

  details: GradeDetailFirestore[];
}

export interface GradeDetailFirestore {
  // 取得済みか
  has: boolean;
  // 取得した日
  date: Date;
}

export interface WorkFirestore {
  group: ScoutUnit;
  type: string;
  begin: Date;
  end: Date;
}
