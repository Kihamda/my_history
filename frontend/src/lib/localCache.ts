import type { SearchRequest, SearchResult } from "b@/types/api/search";

export const getScoutsCache = (): SearchResult[] | null => {
  const data = sessionStorage.getItem("scoutsCache");
  return data ? JSON.parse(data) : null;
};

export const setScoutsCache = (data: SearchResult[]): void => {
  sessionStorage.setItem("scoutsCache", JSON.stringify(data));
};

export const getSearchQueryCache = (): SearchRequest | null => {
  const data = localStorage.getItem("searchQueryCache");
  return data ? JSON.parse(data) : null;
};

export const setSearchQueryCache = (data: SearchRequest): void => {
  localStorage.setItem("searchQueryCache", JSON.stringify(data));
};
