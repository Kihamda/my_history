import { GinoshoMasterList } from "@/types/scout/ginosho";

export const getGinoshoMasterList = async (): Promise<GinoshoMasterList[]> => {
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
    return item as GinoshoMasterList;
  });

  return data;
};
