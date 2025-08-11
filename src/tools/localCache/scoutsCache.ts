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
