import { z } from "zod";
import { CurrentUnitId } from "./scout";

export const SearchRequest = z.object({
  name: z.string(),
  scoutId: z.string(),
  currentUnit: z.array(CurrentUnitId),
});

export type SearchRequestType = z.infer<typeof SearchRequest>;

export const SearchResult = z.object({
  id: z.string(),
  name: z.string(),
  scoutId: z.string(),
  currentUnitId: CurrentUnitId,
  currentUnitName: z.string(),
});

export type SearchResultType = z.infer<typeof SearchResult>;
