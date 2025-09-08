export interface Ginosho {
  // 固有ID
  id: string;

  // 技能章のID
  unique: string;

  // 技能章の名称
  name: string;

  // 技能章の考査員名
  certName: string;

  // 考査員認定か
  cert: boolean;

  // 技能章の取得日
  date: Date;

  // メモ
  description: string;

  // 細目
  details: GinoshoDetail[];
}

export interface GinoshoDetail {
  id: string;
  checked: boolean;
}
