import { CurrentUnitId } from "./scout";

export interface SearchRequest {
  name: string;
  scoutId: string;
  currentUnit: CurrentUnitId[];
}

export interface SearchResult {
  id: string;
  name: string;
  scoutId: string;
  currentUnitId: CurrentUnitId;
  currentUnitName: string;
}
