import { ScoutUnit, ScoutUnitList } from "@/types/scoutUnit";
import SearchQuery from "@/types/search/searchQueryType";

const queryParser = (searchName: string): SearchQuery => {
  // 送られてきた文字列が何かを判定する［名前・登録番号・所属隊］
  let scoutId: string = "";
  let name: string = "";
  let currentUnit: ScoutUnit[] = [];
  let experiencedUnit: ScoutUnit[] = [];

  if (searchName) {
    /* 条件
    1. bvs,vs等だけが含まれる場合は所属隊
       入力をすべてlowerCaseにして、スペースを消してsplit(",")してfor回して合致したものをcurrentUnitにpushする
    2. 9-12桁の数字だけが含まれる場合は登録番号
    3. それ以外は名前
    とする */

    // 入力を正規化
    const normalizedSearchName = searchName
      // 全角文字を半角に変換（英数字、記号、カタカナ）
      .replace(/[Ａ-Ｚａ-ｚ０-９！-～]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xfee0)
      )
      // カタカナをひらがなに変換
      .replace(/[\u30a1-\u30f6]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0x60)
      )
      // 小文字に統一
      .toLowerCase()
      // 空白文字を除去（スペース、タブ、改行など）
      .replace(/\s+/g, "")
      // 特殊文字を除去（英数字、ひらがな、カンマ以外）
      .replace(/[^\w\u3040-\u309f,]/g, "");

    // カンマで分割して重複を除去、各要素が所属隊のIDと一致するかチェック
    const potentialUnits = [...new Set(normalizedSearchName.split(","))];
    const allUnitsMatch = potentialUnits.every((unit) =>
      ScoutUnitList.some((scoutUnit) => scoutUnit === unit)
    );

    if (allUnitsMatch && potentialUnits.join("") !== "") {
      // すべてが所属隊リストに存在する場合
      currentUnit = potentialUnits.map(
        (unitId) => ScoutUnitList.find((scoutUnit) => scoutUnit === unitId)!
      ) as ScoutUnit[];
    } else if (normalizedSearchName.match(/^\d{9,12}$/)) {
      // 9-12桁の数字の場合
      scoutId = normalizedSearchName;
    } else {
      // それ以外は名前
      name = searchName;
    }
  }

  return {
    scoutId,
    name,
    currentUnit,
    experiencedUnit,
  };
};

export default queryParser;
