import { ScoutUnit } from "@/types/scout/unit";

export interface SearchQuery {
  scoutId: string;
  name: string;
  currentUnit: ScoutUnit[];
}

export interface SearchResult {
  id: string;
  name: string;
  scoutId: string;
  currentUnit: ScoutUnit;
  experiencedUnits: ScoutUnit[];
}
