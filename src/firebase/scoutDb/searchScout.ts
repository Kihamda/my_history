import SearchQuery from "@/types/search/searchQueryType";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  where,
  query,
  Query,
  DocumentData,
} from "firebase/firestore";
import { ScoutRecord } from "../firebaseDataType/scouts/scoutRecord";
import { raiseError } from "@/errorHandler";
import { Scout } from "@/types/scout/scout";
import convertTimestampsDate from "../convertTimestampDate";

/**
 * スカウトを検索する関数
 * @param searchQuery 検索クエリ
 * @returns 検索結果のスカウトデータの配列
 */
export const searchScout = async (
  searchQuery: SearchQuery,
  groupId: string
): Promise<Scout[]> => {
  console.log("searchScout called with query:", searchQuery);

  const scoutsRef = collection(db, "scouts");

  // 検索条件を動的に構築
  const conditions = [];

  // 名前での検索（部分一致は後でフィルタリング）
  if (searchQuery.name && searchQuery.name.trim() !== "") {
    // Firestoreは部分一致検索が苦手なので、完全一致で取得後にフィルタリング
    // または範囲検索を使用
    conditions.push(where("personal.name", ">=", searchQuery.name));
    conditions.push(where("personal.name", "<=", searchQuery.name + "\uf8ff"));
  }

  // スカウトIDでの検索
  if (searchQuery.scoutId && searchQuery.scoutId.trim() !== "") {
    conditions.push(where("personal.ScoutId", "==", searchQuery.scoutId));
  }

  // 現在の所属での検索
  if (searchQuery.currentUnit && searchQuery.currentUnit.length > 0) {
    conditions.push(
      where("personal.currentUnit", "in", searchQuery.currentUnit)
    );
  }

  // クエリを構築
  // 自分のグループに所属している必要がある
  conditions.push(where("personal.belongs", "==", groupId));
  let q: Query<DocumentData>;
  if (conditions.length > 1) {
    // この1はグループIDの1
    q = query(scoutsRef, ...conditions);
  } else {
    // 検索条件がない場合は全件取得
    raiseError("検索条件が設定されませんでした。");
    return [];
  }

  try {
    const snapshot = await getDocs(q);

    const scouts: Scout[] = [];
    snapshot.forEach((doc) => {
      const scoutData = convertTimestampsDate(doc.data()) as ScoutRecord;
      const scout: Scout = {
        id: doc.id,
        personal: scoutData.personal,
        unit: scoutData.unit,
      };

      // 名前での部分一致フィルタリング（Firestoreの制限を補完）
      if (searchQuery.name && searchQuery.name.trim() !== "") {
        if (
          scout.personal.name
            .toLowerCase()
            .includes(searchQuery.name.toLowerCase())
        ) {
          scouts.push(scout);
        }
      } else {
        scouts.push(scout);
      }
    });

    return scouts;
  } catch (error) {
    raiseError("スカウトデータの検索に失敗しました。", "" + error);
    console.error("Error fetching scout data:", error);
    return [];
  }
};

export default searchScout;
