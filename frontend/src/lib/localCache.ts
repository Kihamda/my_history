import type { ScoutSearchRequest } from "./api/apiTypes";

export const getSearchQueryCache = (
  groupId: string,
): ScoutSearchRequest | null => {
  const data = localStorage.getItem(`searchQueryCache:${groupId}`);
  return data ? JSON.parse(data) : null;
};

export const setSearchQueryCache = (
  groupId: string,
  data: ScoutSearchRequest,
): void => {
  localStorage.setItem(`searchQueryCache:${groupId}`, JSON.stringify(data));
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
