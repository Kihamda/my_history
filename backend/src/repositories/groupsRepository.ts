// 団体情報とメンバー権限を Firestore から取得するためのリポジトリ。
import { FirestoreClient } from "../lib/firestore";
import type { AppBindings } from "../types/bindings";
import type {
  CurrentGroupContext,
  GroupMemberRecord,
  GroupRecord,
} from "../types/domain/group";

const GROUPS_COLLECTION = "groups";

const buildClient = (env: AppBindings, idToken: string) =>
  new FirestoreClient(env, idToken);

export const getGroupRecord = async (
  env: AppBindings,
  idToken: string,
  groupId: string
): Promise<GroupRecord | null> => {
  // グループ本体のメタ情報を取得。
  const client = buildClient(env, idToken);
  return client.getDocument<GroupRecord>(`${GROUPS_COLLECTION}/${groupId}`);
};

export const getGroupMemberRecord = async (
  env: AppBindings,
  idToken: string,
  groupId: string,
  email: string
): Promise<GroupMemberRecord | null> => {
  // メンバーサブコレクションに紐づくユーザーの権限情報を取得。
  const client = buildClient(env, idToken);
  return client.getDocument<GroupMemberRecord>(
    `${GROUPS_COLLECTION}/${groupId}/members/${encodeURIComponent(email)}`
  );
};

export const getCurrentGroupContext = async (
  env: AppBindings,
  idToken: string,
  joinGroupId: string | null | undefined,
  email: string | undefined
): Promise<CurrentGroupContext | null> => {
  // ユーザーが所属情報を持たない場合は null を返してハンドラ側で未所属扱いにする。
  if (!joinGroupId || !email) {
    return null;
  }

  const [group, member] = await Promise.all([
    getGroupRecord(env, idToken, joinGroupId),
    getGroupMemberRecord(env, idToken, joinGroupId, email),
  ]);

  if (!group || !member) {
    return null;
  }

  const isAdmin = member.role === "admin";
  const isEditable = member.role === "admin" || member.role === "edit";
  const isLeader = isEditable || member.role === "view";

  // UI が利用しやすい形へ整形して返す。
  return {
    id: joinGroupId,
    name: group.name,
    isAdmin,
    isEditable,
    isLeader,
  };
};
