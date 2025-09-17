import { GinoshoDetail } from "@/types/scout/ginosho";

export interface FirestoreGinosho {
  /** 技能章のID */
  id: string;

  // 取得済みか
  has: boolean;

  // 取得日時
  date: Date;

  // 技能章の考査員名
  certName: string;

  // 細目
  details: GinoshoDetail[];
}
