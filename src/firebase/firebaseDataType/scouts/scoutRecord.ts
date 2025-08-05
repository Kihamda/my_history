import { ScoutPersonalData } from "@/types/scout/scout";
import { UnitExperience } from "@/types/scout/scoutUnit";

export interface ScoutRecord {
  personal: ScoutPersonalData;

  unit: UnitExperience;
}
