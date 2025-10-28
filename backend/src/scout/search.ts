import { Context } from "../apiRotuer";
import { FirestoreReturn } from "../lib/firestore/firestore";
import { ScoutRecordSchemaType } from "../lib/firestore/scoute";
import { SearchRequestType, SearchResultType } from "../types/api/search";
import { ScoutUnitNameMap } from "../types/common/scoutGroup";

/**
 * Scout 一覧を検索する
 * @param query 検索クエリ
 * @return 検索結果
 *
 */

interface SearchScoutsQuery extends SearchRequestType {
  groupId: string;
}

const searchScouts = async (
  query: SearchScoutsQuery,
  c: Context
): Promise<SearchResultType[]> => {
  const firestoreQuery = [];

  if (query.name) {
    firestoreQuery.push({
      field: "personal.name",
      op: ">=",
      value: query.name,
    });
    firestoreQuery.push({
      field: "personal.name",
      op: "<=",
      value: query.name + "\uf8ff",
    });
  }

  if (query.scoutId) {
    firestoreQuery.push({
      field: "personal.ScoutId",
      op: "==",
      value: query.scoutId,
    });
  }

  if (query.currentUnit.length > 0) {
    firestoreQuery.push({
      field: "personal.currentUnit",
      op: "in",
      value: query.currentUnit,
    });
  } else {
    firestoreQuery.push({
      field: "personal.currentUnit",
      op: "in",
      value: ["bvs", "cs", "bs", "vs", "rs", "ob"],
    });
  }
  firestoreQuery.push({
    field: "personal.belongs",
    op: "==",
    value: query.groupId,
  });

  //１ページあたり20件で固定
  const limit = 20;

  // 取得
  const results = (await c.var.db.query("scouts", {
    where: firestoreQuery,
    limit,
    offset: (query.page - 1) * limit,
  })) as unknown as FirestoreReturn<ScoutRecordSchemaType>[];

  return results.map((doc) => {
    const ot: SearchResultType = {
      id: doc.id,
      name: doc.personal.name,
      scoutId: doc.personal.scoutId,
      currentUnitId: doc.personal.currentUnitId,
      currentUnitName: ScoutUnitNameMap[doc.personal.currentUnitId],
    };
    return ot;
  });
};

export default searchScouts;
