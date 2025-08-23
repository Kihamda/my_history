export interface Ginosho {
  // 固有ID
  id: string;

  // 技能章のID
  unique: string;

  // 技能章の考査員名
  certName: string;

  // 技能章の取得日
  date: Date;

  // メモ
  description: string;

  // 細目
  details: GinoshoDetail[];
}

export interface GinoshoMasterList {
  id: string;
  name: string;
  cert: boolean;
  url: string;
}

export interface GinoshoDetail {
  id: string;
  checked: boolean;
}
