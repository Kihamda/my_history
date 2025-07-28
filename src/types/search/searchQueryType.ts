import { ScoutUnit } from "@/types/scoutUnit";

export default interface SearchQuery {
  scoutId: string;
  name: string;
  currentUnit: ScoutUnit[];
  experiencedUnit: ScoutUnit[];
}
