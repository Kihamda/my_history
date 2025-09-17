export interface Ginosho {
  // 固有ID
  id: string;

  // 取得済みかどうか
  has: boolean;

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

  // 細目
  details: GinoshoDetail[];
}

export interface GinoshoDetail {
  id: number;
  description: string;
  number: string;
  checked: boolean;
  date: Date;
}
