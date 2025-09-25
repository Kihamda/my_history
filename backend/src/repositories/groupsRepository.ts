import { FirestoreClient } from "../lib/firestore";
import type { AppBindings } from "../types/bindings";
import type {
  CurrentGroupContext,
  GroupMemberRecord,
  GroupRecord,
} from "../types/domain/group";

const GROUPS_COLLECTION = "groups";

const buildClient = (env: AppBindings) => new FirestoreClient(env);

export const getGroupRecord = async (
  env: AppBindings,
  groupId: string
): Promise<GroupRecord | null> => {
  const client = buildClient(env);
  return client.getDocument<GroupRecord>(`${GROUPS_COLLECTION}/${groupId}`);
};

export const getGroupMemberRecord = async (
  env: AppBindings,
  groupId: string,
  email: string
): Promise<GroupMemberRecord | null> => {
  const client = buildClient(env);
  return client.getDocument<GroupMemberRecord>(
    `${GROUPS_COLLECTION}/${groupId}/members/${encodeURIComponent(email)}`
  );
};

export const getCurrentGroupContext = async (
  env: AppBindings,
  joinGroupId: string | null | undefined,
  email: string | undefined
): Promise<CurrentGroupContext | null> => {
  if (!joinGroupId || !email) {
    return null;
  }

  const [group, member] = await Promise.all([
    getGroupRecord(env, joinGroupId),
    getGroupMemberRecord(env, joinGroupId, email),
  ]);

  if (!group || !member) {
    return null;
  }

  const isAdmin = member.role === "admin";
  const isEditable = member.role === "admin" || member.role === "edit";
  const isLeader = isEditable || member.role === "view";

  return {
    id: joinGroupId,
    name: group.name,
    isAdmin,
    isEditable,
    isLeader,
  };
};
