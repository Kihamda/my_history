import { FirestoreClient } from "firebase-rest-firestore";
import {
  ScoutRecordSchema,
  ScoutRecordSchemaType,
  CurrentUnitIdType,
} from "../schemas";
import { FirestoreReturn } from "../firestore";

// ========================================
// Firestore操作層: Scoutコレクション
// この層はFirestoreの直接的な操作のみを行う
// ビジネスロジックや権限チェックは含まない
// ========================================

/**
 * Scout IDからScoutデータを取得
 */
export const getScoutById = async (
  db: FirestoreClient,
  id: string
): Promise<ScoutRecordSchemaType | null> => {
  const doc = await db.collection("scouts").doc(id).get();
  if (!doc.exists) return null;

  const data = doc.data() as unknown as ScoutRecordSchemaType;
  console.log("Raw scout data:", data);
  return ScoutRecordSchema.parse(data);
};

/**
 * 新規Scoutデータを作成
 */
export const createScoutRecord = async (
  db: FirestoreClient,
  id: string,
  data: ScoutRecordSchemaType
): Promise<void> => {
  const validated = ScoutRecordSchema.parse(data);
  await db.collection("scouts").doc(id).set(validated);
};

/**
 * Scoutデータを更新
 */
export const updateScoutRecord = async (
  db: FirestoreClient,
  id: string,
  data: Partial<ScoutRecordSchemaType>
): Promise<void> => {
  await db.collection("scouts").doc(id).update(data);
};

/**
 * Scoutデータを削除
 */
export const deleteScoutRecord = async (
  db: FirestoreClient,
  id: string
): Promise<void> => {
  await db.collection("scouts").doc(id).delete();
};

/**
 * Scout検索用のクエリ型
 */
export interface ScoutSearchQuery {
  name?: string;
  scoutId?: string;
  currentUnit?: CurrentUnitIdType[];
  belongGroupId: string;
  page: number;
  limit?: number;
}

/**
 * Scoutを検索
 */
export const searchScouts = async (
  db: FirestoreClient,
  query: ScoutSearchQuery
): Promise<FirestoreReturn<ScoutRecordSchemaType>[]> => {
  const firestoreQuery: any[] = [];

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
      field: "personal.scoutId",
      op: "==",
      value: query.scoutId,
    });
  }

  if (query.currentUnit && query.currentUnit.length > 0) {
    firestoreQuery.push({
      field: "personal.currentUnitId",
      op: "in",
      value: query.currentUnit,
    });
  }

  firestoreQuery.push({
    field: "personal.belongGroupId",
    op: "==",
    value: query.belongGroupId,
  });

  const limit = query.limit ?? 20;
  const offset = (query.page - 1) * limit;

  const results = (await db.query("scouts", {
    where: firestoreQuery,
    limit,
    offset,
  })) as unknown as FirestoreReturn<ScoutRecordSchemaType>[];

  return results;
};

/**
 * 特定グループに所属するScout数を取得
 */
export const countScoutsByGroup = async (
  db: FirestoreClient,
  groupId: string
): Promise<number> => {
  const results = await db.query("scouts", {
    where: [
      {
        field: "personal.belongGroupId",
        op: "==",
        value: groupId,
      },
    ],
  });
  return (results as any[]).length;
};
