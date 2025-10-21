import { Context } from "../apiRotuer";
import { FirestoreReturn } from "../lib/firestore/firestore";
import { SearchRequestType, SearchResultType } from "../types/api/search";
import { ScoutUnitNameMap } from "../types/common/scoutGroup";
import { FirestoreScout } from "../lib/firestore/scout";

/**
 * Scout 一覧を検索する
 * @param query 検索クエリ
 * @return 検索結果
 *
 */

interface SearchScoutsQuery extends SearchRequestType {
  groupId: string;
}

const searchScouts = async (query: SearchScoutsQuery, c: Context) => {
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

  console.log(firestoreQuery);

  // 取得
  const results = (await c.var.db.query("scouts", {
    where: firestoreQuery,
    limit: 10,
  })) as unknown as FirestoreReturn<FirestoreScout>[];

  return c.json(
    results.map((doc) => {
      console.log(doc);
      const ot: SearchResultType = {
        id: doc.id,
        name: doc.name,
        scoutId: doc.scoutId,
        currentUnitId: doc.currentUnitId,
        currentUnitName: ScoutUnitNameMap[doc.currentUnitId],
      };
      return ot;
    })
  );
};

export default searchScouts;
