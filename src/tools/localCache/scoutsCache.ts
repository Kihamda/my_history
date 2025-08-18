import { Scout } from "@/types/scout/scout";

export const setScoutsCache = (scouts: Scout[]) => {
  // スカウトデータをローカルストレージに保存する関数
  localStorage.setItem("scouts", JSON.stringify(scouts));
};

export const getScoutsCache = (): Scout[] | null => {
  // ローカルストレージからスカウトデータを取得する関数
  const scouts: Scout[] = JSON.parse(localStorage.getItem("scouts") || "[]");

  return scouts?.length > 0 ? scouts : null;
};

export const clearScoutsCache = (targetId?: string) => {
  // スカウトデータのキャッシュをクリアする関数
  if (targetId) {
    // 特定のスカウトIDのキャッシュを削除
    const scouts = getScoutsCache();
    if (scouts) {
      const updatedScouts = scouts.filter((scout) => scout.id !== targetId);
      setScoutsCache(updatedScouts);
    }
    return;
  }
  localStorage.removeItem("scouts");
};
