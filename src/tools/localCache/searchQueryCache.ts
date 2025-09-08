import { SearchQuery } from "@/types/search/searchQueryType";

export const setSearchQueryCache = (query: SearchQuery) => {
  // 検索クエリをローカルストレージに保存する関数
  localStorage.setItem("searchQuery", JSON.stringify(query));
};

export const getSearchQueryCache = (): SearchQuery | null => {
  // ローカルストレージから検索クエリを取得する関数
  const searchQuery: SearchQuery = JSON.parse(
    localStorage.getItem("searchQuery") || "{}"
  );

  return Object.keys(searchQuery).length > 0 ? searchQuery : null;
};
