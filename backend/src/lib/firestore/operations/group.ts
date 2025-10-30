import { FirestoreClient } from "firebase-rest-firestore";
import { GroupRecordSchema, GroupRecordSchemaType } from "../schemas";

// ========================================
// Firestore操作層: Groupコレクション
// ========================================

/**
 * Group IDからGroupデータを取得
 */
export const getGroupById = async (
  db: FirestoreClient,
  id: string
): Promise<GroupRecordSchemaType | null> => {
  const doc = await db.collection("groups").doc(id).get();
  if (!doc.exists) return null;

  const data = doc.data() as unknown as GroupRecordSchemaType;
  return GroupRecordSchema.parse(data);
};

/**
 * 新規Groupデータを作成
 */
export const createGroupRecord = async (
  db: FirestoreClient,
  id: string,
  data: GroupRecordSchemaType
): Promise<void> => {
  const validated = GroupRecordSchema.parse(data);
  await db.collection("groups").doc(id).set(validated);
};

/**
 * Groupデータを更新
 */
export const updateGroupRecord = async (
  db: FirestoreClient,
  id: string,
  data: Partial<GroupRecordSchemaType>
): Promise<void> => {
  await db.collection("groups").doc(id).update(data);
};

/**
 * Groupデータを削除
 */
export const deleteGroupRecord = async (
  db: FirestoreClient,
  id: string
): Promise<void> => {
  await db.collection("groups").doc(id).delete();
};

/**
 * すべてのアクティブなグループを取得
 */
export const getActiveGroups = async (
  db: FirestoreClient
): Promise<GroupRecordSchemaType[]> => {
  const results = (await db.query("groups", {
    where: [
      {
        field: "status",
        op: "==",
        value: "ACTIVE",
      },
    ],
  })) as unknown as GroupRecordSchemaType[];

  return results.map((r) => GroupRecordSchema.parse(r));
};
