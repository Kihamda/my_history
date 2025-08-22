export interface Ginosho {
  // 固有ID
  id: string;

  // 技能章のID
  unique: string;

  // 技能章の取得日
  date: Date;

  // メモ
  description: string;
}

export interface GinoshoMasterList {
  id: string;
  name: string;
  cert: string;
  url: string;
}
