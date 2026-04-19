import type { ScoutSearchResponse } from "@f/lib/api/apiTypes";

export const getResultsCache = (): ScoutSearchResponse => {
  if (typeof window === "undefined") return [];
  const cache = window.sessionStorage.getItem("resultsCache");
  return cache ? JSON.parse(cache) : [];
};

export const setResultsCache = (data: ScoutSearchResponse) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("resultsCache", JSON.stringify(data));
};
export const clearResultsCache = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("resultsCache");
};
