import { SearchQuery, SearchResult } from "@/types/search/searchQueryType";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  where,
  query,
  Query,
  DocumentData,
  limit,
} from "firebase/firestore";
import { FirestoreScout } from "../firebaseDataType/scouts/scout";
import { raiseError } from "@/errorHandler";
import convertTimestampsDate from "../convertTimestampDate";

/**
 * スカウトを検索する関数
 * @param searchQuery 検索クエリ
 * @returns 検索結果のスカウトデータの配列
 */
export const searchScout = async (
  searchQuery: SearchQuery,
  groupId: string
): Promise<SearchResult[]> => {
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

  // 爆死対策
  conditions.push(limit(30));

  let q: Query<DocumentData>;
  if (conditions.length > 2) {
    // この1はグループIDの1
    q = query(scoutsRef, ...conditions);
  } else {
    // 検索条件がない場合は全件取得
    raiseError("検索条件が設定されませんでした。");
    return [];
  }

  try {
    const snapshot = await getDocs(q);

    const scouts: SearchResult[] = [];
    snapshot.forEach((doc) => {
      const scoutData = convertTimestampsDate(doc.data()) as FirestoreScout;
      const scout: SearchResult = {
        id: doc.id,
        name: scoutData.personal.name,
        scoutId: scoutData.personal.ScoutId,
        currentUnit: scoutData.personal.currentUnit,
        experiencedUnits: scoutData.unit.map((u) => u.id),
      };

      // 名前での部分一致フィルタリング（Firestoreの制限を補完）
      if (searchQuery.name && searchQuery.name.trim() !== "") {
        if (scout.name.toLowerCase().includes(searchQuery.name.toLowerCase())) {
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
