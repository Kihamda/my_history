import { Context } from "../apiRotuer";
import { FirestoreReturn } from "../lib/firestore";
import { SearchRequest, SearchResult } from "../types/api/search";
import { ScoutUnit, ScoutUnitNameMap } from "../types/common/scoutGroup";
import { FirestoreScout } from "../types/firestore/scout";
import { FirestoreUser } from "../types/firestore/user";

const searchScouts = async (c: Context) => {
  const user = c.var.authToken;

  if (!c.req.query()) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  const queryRaw = JSON.parse(c.req.query().q || "{}");

  const query: SearchRequest = {
    name: queryRaw.name || "",
    scoutId: queryRaw.scoutId || "",
    currentUnit: queryRaw.currentUnit
      ? ((Array.isArray(queryRaw.currentUnit)
          ? queryRaw.currentUnit
          : [queryRaw.currentUnit]) as ScoutUnit[])
      : [],
  };

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
    value: (
      (await c.var.db.get(`users/`, user.uid)) as FirestoreReturn<FirestoreUser>
    ).joinedGroupId,
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
      const ot: SearchResult = {
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
