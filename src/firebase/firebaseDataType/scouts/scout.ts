import { ScoutPersonalData } from "@/types/scout/scout";
import { ScoutUnit } from "@/types/scout/scoutUnit";

export interface FirestoreScout {
  personal: ScoutPersonalData;

  unit: UnitExperience[];
}

export interface FirestoreAuthedUser {
  /** 認証されたユーザーの表示名 */
  displayName?: string;

  role: "edit" | "view";
}

export interface UnitExperience {
  id: ScoutUnit;
  // 入隊日
  joinedDate: Date;

  experienced: boolean;
  // 取得したバッジ
  grade: ScoutUnitGrade[];

  works: Work[];
}

export interface ScoutUnitGrade {
  id: string;
  // グレード名
  has: boolean;
  // 取得した日
  date: Date;
}

export interface Work {
  type: string; // 役職名
  begin: Date; // 開始日
  end: Date; // 終了日
}
