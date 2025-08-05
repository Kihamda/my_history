import { ScoutUnit } from "@/types/scout/scoutUnit";

export default interface SearchQuery {
  scoutId: string;
  name: string;
  currentUnit: ScoutUnit[];
}
