export interface GinoshoMaster {
  id: string;
  name: string;
  cert: boolean;
  url: string;
}

export interface GinoshoDetailMaster extends GinoshoMaster {
  details: Array<{ id: number; number: number; name: string }>; // 細目のマスターデータ
}

export const getGinoshoMasterList = async (): Promise<GinoshoMaster[]> => {
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

  return data;
};

export const getGinoshoDetail = async (
  id: string
): Promise<GinoshoDetailMaster | null> => {
  const response = await fetch(`/data/ginosho/${id}.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch ginosho detail");
  }
  const data = await response.json();
  return data as GinoshoDetailMaster;
};
