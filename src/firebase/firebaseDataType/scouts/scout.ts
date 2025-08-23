import { ScoutPersonalData } from "@/types/scout/scout";
import { UnitExperience } from "@/types/scout/scoutUnit";

export interface FirestoreScout {
  personal: ScoutPersonalData;

  unit: UnitExperience;
}

export interface FirestoreAuthedUser {
  /** 認証されたユーザーの表示名 */
  displayName?: string;

  role: "edit" | "view";
}
