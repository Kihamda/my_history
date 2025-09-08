export interface GradeMaster {
  id: string;
  name: string;
  unit: string;
}

export const getGradeMasterList = async (): Promise<GradeMaster[]> => {
  // キャッシュを確認
  const localCache = sessionStorage.getItem("gradeMasterCache");
  if (localCache) {
    return JSON.parse(localCache);
  }

  // キャッシュがなければ取得
  const response = await fetch(`/data/grade.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch ginosho");
  }
  const data = await response.json();

  // キャッシュに保存
  sessionStorage.setItem("gradeMasterCache", JSON.stringify(data));
  return data;
};

export const getGradeName = (id: string, tryCount?: number): string => {
  const data = sessionStorage.getItem("gradeMasterCache");
  if (data) {
    const list: GradeMaster[] = JSON.parse(data);
    const item = list.find((g) => g.id === id);
    return item ? item.name : id;
  }
  getGradeMasterList(); // 非同期で取得を試みる
  return tryCount && tryCount > 3 ? id : getGradeName(id, (tryCount || 0) + 1);
};

export interface GradeDetailMaster extends GradeMaster {
  details: Array<{ id: number; number: number; name: string }>; // 細目のマスターデータ
}

export const getGradeDetail = async (
  id: string
): Promise<GradeDetailMaster | null> => {
  // キャッシュを確認
  const localCache = sessionStorage.getItem(`gradeDetailCache_${id}`);
  if (localCache) {
    return JSON.parse(localCache);
  }

  // キャッシュがなければ取得
  const response = await fetch(`/data/grade/${id}.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch grade detail");
  }
  const data = await response.json();

  // キャッシュに保存
  sessionStorage.setItem(`gradeDetailCache_${id}`, JSON.stringify(data));
  return data as GradeDetailMaster;
};
