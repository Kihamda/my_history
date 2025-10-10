export const getResultsCache = () => {
  if (typeof window === "undefined") return null;
  const cache = window.sessionStorage.getItem("resultsCache");
  return cache ? JSON.parse(cache) : null;
};

export const setResultsCache = (data: any) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("resultsCache", JSON.stringify(data));
};
export const clearResultsCache = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("resultsCache");
};
export const getSearchQueryCache = () => {
  if (typeof window === "undefined") return null;
  const cache = window.localStorage.getItem("searchQueryCache");
  return cache ? JSON.parse(cache) : null;
};
export const setSearchQueryCache = (data: any) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("searchQueryCache", JSON.stringify(data));
};
export const clearSearchQueryCache = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("searchQueryCache");
};
