import { SearchResult } from "@/types/search/searchQueryType";

export const setScoutsCache = (scouts: SearchResult[]) => {
  // スカウトデータをローカルストレージに保存する関数
  sessionStorage.setItem("scouts", JSON.stringify(scouts));
};

export const setSpecificScoutCache = (scout: SearchResult) => {
  // 特定のスカウトデータをローカルストレージに保存する関数
  const scouts = getScoutsCache() || [];
  const updatedScouts = scouts.filter((s) => s.id !== scout.id);
  updatedScouts.push(scout);
  setScoutsCache(updatedScouts);
};

export const getScoutsCache = (): SearchResult[] | null => {
  // ローカルストレージからスカウトデータを取得する関数
  const scouts: SearchResult[] = JSON.parse(
    sessionStorage.getItem("scouts") || "[]"
  );

  return scouts?.length > 0 ? scouts : null;
};

export const clearScoutsCache = () => {
  // スカウトデータのキャッシュをクリアする関数
  sessionStorage.removeItem("scouts");
};

export const clearSpecificScoutCache = (targetId: string) => {
  // 特定のスカウトIDのキャッシュをクリアする関数
  const scouts = getScoutsCache();
  if (scouts) {
    const updatedScouts = scouts.filter((scout) => scout.id !== targetId);
    setScoutsCache(updatedScouts);
  }
};
