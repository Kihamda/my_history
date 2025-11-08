import type { ScoutSearchRequest, ScoutSearchResponse } from "./api/apiTypes";

export const getScoutsCache = (): ScoutSearchResponse[] | null => {
  const data = sessionStorage.getItem("scoutsCache");
  return data ? JSON.parse(data) : null;
};

export const setScoutsCache = (data: ScoutSearchResponse[]): void => {
  sessionStorage.setItem("scoutsCache", JSON.stringify(data));
};

export const getSearchQueryCache = (): ScoutSearchRequest | null => {
  const data = localStorage.getItem("searchQueryCache");
  return data ? JSON.parse(data) : null;
};

export const setSearchQueryCache = (data: ScoutSearchRequest): void => {
  localStorage.setItem("searchQueryCache", JSON.stringify(data));
};
