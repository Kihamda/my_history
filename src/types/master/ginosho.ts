import { raiseError } from "@/errorHandler";

export interface GinoshoMaster {
  id: string;
  name: string;
  cert: boolean;
  url: string;
}

export interface GinoshoDetailMaster extends GinoshoMaster {
  details: Array<{ sort: number; number: string; description: string }>; // 細目のマスターデータ
}

export const getGinoshoMasterList = async (): Promise<GinoshoMaster[]> => {
  // キャッシュを確認
  const localCache = sessionStorage.getItem("ginoshoMasterCache");
  if (localCache) {
    try {
      return JSON.parse(localCache);
    } catch (e) {
      raiseError("Failed to parse ginosho master cache");
    }
  }

  const response = await fetch(`/data/ginosho.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch ginosho");
  }
  const data = await response.json();
  data.map((item: any) => {
    if (item.cert == "true") {
      item.cert = true;
    } else {
      item.cert = false;
    }
    return item as GinoshoMaster;
  });

  // キャッシュに保存
  sessionStorage.setItem("ginoshoMasterCache", JSON.stringify(data));

  return data;
};

export const getGinoshoDetail = async (
  id: string
): Promise<GinoshoDetailMaster | null> => {
  // キャッシュを確認
  const localCache = sessionStorage.getItem(`ginoshoDetailCache_${id}`);
  if (localCache) {
    return JSON.parse(localCache);
  }

  const response = await fetch(`/data/ginosho/${id}.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch ginosho detail");
  }
  const data = await response.json();

  // キャッシュに保存
  sessionStorage.setItem(`ginoshoDetailCache_${id}`, JSON.stringify(data));
  return data as GinoshoDetailMaster;
};
