import { Scout } from "@/types/scout/scout";

export const setScoutsCache = (scouts: Scout[]) => {
  // スカウトデータをローカルストレージに保存する関数
  localStorage.setItem("scouts", JSON.stringify(scouts));
};

export const setSpecificScoutCache = (scout: Scout) => {
  // 特定のスカウトデータをローカルストレージに保存する関数
  const scouts = getScoutsCache() || [];
  const updatedScouts = scouts.filter((s) => s.id !== scout.id);
  updatedScouts.push(scout);
  setScoutsCache(updatedScouts);
};

export const getScoutsCache = (): Scout[] | null => {
  // ローカルストレージからスカウトデータを取得する関数
  const scouts: Scout[] = JSON.parse(localStorage.getItem("scouts") || "[]");

  return scouts?.length > 0 ? scouts : null;
};

export const clearScoutsCache = () => {
  // スカウトデータのキャッシュをクリアする関数
  localStorage.removeItem("scouts");
};

export const clearSpecificScoutCache = (targetId: string) => {
  // 特定のスカウトIDのキャッシュをクリアする関数
  const scouts = getScoutsCache();
  if (scouts) {
    const updatedScouts = scouts.filter((scout) => scout.id !== targetId);
    setScoutsCache(updatedScouts);
  }
};
