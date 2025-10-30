import { z } from "zod";
import { CurrentUnitId } from "../../lib/firestore/schemas";

export const SearchRequest = z.object({
  name: z.string().optional().default(""),
  scoutId: z.string().optional().default(""),
  currentUnit: z.array(CurrentUnitId).optional().default([]),
  page: z.coerce.number().min(1).default(1),
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
