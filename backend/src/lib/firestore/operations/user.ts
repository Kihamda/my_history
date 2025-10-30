import { FirestoreClient } from "firebase-rest-firestore";
import { UserRecordSchema, UserRecordSchemaType } from "../schemas";

// ========================================
// Firestore操作層: Userコレクション
// ========================================

/**
 * User IDからUserデータを取得
 */
export const getUserById = async (
  db: FirestoreClient,
  uid: string
): Promise<UserRecordSchemaType | null> => {
  const doc = await db.collection("users").doc(uid).get();
  if (!doc.exists) return null;

  const data = doc.data() as unknown as UserRecordSchemaType;
  return UserRecordSchema.parse(data);
};

/**
 * 新規Userデータを作成
 */
export const createUserRecord = async (
  db: FirestoreClient,
  uid: string,
  data: UserRecordSchemaType
): Promise<void> => {
  const validated = UserRecordSchema.parse(data);
  await db.collection("users").doc(uid).set(validated);
};

/**
 * Userデータを更新
 */
export const updateUserRecord = async (
  db: FirestoreClient,
  uid: string,
  data: Partial<UserRecordSchemaType>
): Promise<void> => {
  await db.collection("users").doc(uid).update(data);
};

/**
 * Userデータを削除
 */
export const deleteUserRecord = async (
  db: FirestoreClient,
  uid: string
): Promise<void> => {
  await db.collection("users").doc(uid).delete();
};

/**
 * 特定グループに所属するユーザー一覧を取得
 */
export const getUsersByGroup = async (
  db: FirestoreClient,
  groupId: string
): Promise<UserRecordSchemaType[]> => {
  const results = (await db.query("users", {
    where: [
      {
        field: "joinedGroupId",
        op: "==",
        value: groupId,
      },
    ],
  })) as unknown as UserRecordSchemaType[];

  return results.map((r) => UserRecordSchema.parse(r));
};
