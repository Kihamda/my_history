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

import { SearchResultScoutData } from "@/types/search/searchQueryType";
export const searchScout = async (
  searchQuery: SearchQuery
): Promise<SearchResultScoutData[]> => {
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
  let q: Query<DocumentData>;
  if (conditions.length > 0) {
    q = query(scoutsRef, ...conditions);
  } else {
    // 検索条件がない場合は全件取得
    q = query(scoutsRef);
  }

  const snapshot = await getDocs(q);

  const scouts: SearchResultScoutData[] = [];
  snapshot.forEach((doc) => {
    const scoutData = doc.data() as ScoutRecord;

    // FirestoreのTimestampをDateオブジェクトに変換
    const scout: SearchResultScoutData = {
      id: doc.id,
      personal: scoutData.personal,
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
};

export default searchScout;
