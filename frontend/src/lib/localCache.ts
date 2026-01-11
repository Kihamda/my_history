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

interface BrowserSettings {
  darkMode: boolean;
  currentGroupSlotId: string | null;
}

export const getBrowserSettings = (): BrowserSettings => {
  return {
    darkMode: localStorage.getItem("darkMode") === "true",
    currentGroupSlotId: localStorage.getItem("currentGroupSlotId"),
  };
};
export const setBrowserSettings = (settings: BrowserSettings): void => {
  localStorage.setItem("darkMode", settings.darkMode.toString());
  if (settings.currentGroupSlotId) {
    localStorage.setItem("currentGroupSlotId", settings.currentGroupSlotId);
  } else {
    localStorage.removeItem("currentGroupSlotId");
  }
};
