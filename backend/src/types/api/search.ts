import { z } from "zod";
import { CurrentUnitId } from "../../lib/firestore/scoute";

export const SearchRequest = z.object({
  name: z.string(),
  scoutId: z.string(),
  currentUnit: z.array(CurrentUnitId),
  page: z.number().min(1),
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
