import { ScoutUnit } from "@/types/scout/scoutUnit";
import { ScoutPersonalData } from "../scout/scout";

export default interface SearchQuery {
  scoutId: string;
  name: string;
  currentUnit: ScoutUnit[];
}

export interface SearchResultScoutData {
  id: string; // スカウトのユニークID
  personal: ScoutPersonalData;
}
