import { HTTPException } from "hono/http-exception";
import type { Context } from "../apiRotuer";
import { db } from "../lib/firestore/firestore";
import {
  IdWithGroupRoleStringifier,
  IdWithShareRoleStringifier,
  type UserRecordSchemaType,
} from "../lib/firestore/schemas";

export const createUserHandler = async (
  c: Context,
  data: UserRecordSchemaType["profile"],
): Promise<{ message: string }> => {
  const token = c.var.token;

  // 既存ユーザーの確認(重複チェック)
  const existing = await db().users.get(token.uid);
  if (existing) {
    throw new HTTPException(409, { message: "User already exists" });
  }

  if (!token.email) {
    throw new HTTPException(400, { message: "Email is required" });
  }

  // Firestoreにユーザーデータを作成
  await db().users.set(token.uid, {
    email: token.email,
    profile: {
      ...data,
    },
    auth: {
      memberships: [],
      invites: [],
      shares: [],
      isGod: false,
    },
  });

  return { message: "User created successfully" };
};

export const updateUserProfileHandler = async (
  c: Context,
  data: UserRecordSchemaType["profile"],
): Promise<{ message: string }> => {
  const token = c.var.token;

  // 既存ユーザーの存在確認
  const user = await db().users.get(token.uid);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  // Firestoreのユーザーデータを更新
  await db().users.set(token.uid, {
    ...user,
    profile: {
      ...data,
    },
  });

  return { message: "User updated successfully" };
};

// 自分のユーザーデータを削除
export const deleteUserHandler = async (
  c: Context,
): Promise<{ message: string }> => {
  const token = c.var.token;

  // Firestoreからユーザーデータを削除
  await db().users.del(token.uid);

  return { message: "User deleted successfully" };
};

// メールアドレスからユーザーを検索
export const searchUserHandler = async (email: string) => {
  // 認可処理：なし => 誰でも実行可能
  const users = await db().users.lis(
    [
      { field: "email", op: "==", value: email },
      { field: "profile.acceptsInvite", op: "==", value: true },
    ],
    10,
  );

  if (users.length === 0) {
    throw new HTTPException(404, { message: "User not found" });
  }
  return users.map((user) => ({
    uid: user.doc_id,
    email: user.email,
    profile: user.profile,
  }));
};

// ユーザー招待を受諾
export const acceptUserInviteHandler = async (
  c: Context,
  groupId: string,
): Promise<{ message: string }> => {
  const user = c.var.user;
  // 招待の存在確認
  const inviteIndex = user.auth.invites.findIndex(
    (invite) => invite.id === groupId,
  );
  if (inviteIndex === -1) {
    throw new HTTPException(404, { message: "Invite not found" });
  }
  // 招待をメンバーシップに移動
  const invite = user.auth.invites[inviteIndex];
  user.auth.invites.splice(inviteIndex, 1);
  user.auth.memberships.push({ id: invite.id, role: invite.role });

  // Firestoreのユーザーデータを更新
  await db().users.set(c.var.token.uid, {
    ...user,
    auth: {
      ...user.auth,
      invites: user.auth.invites.map((inv) => {
        return IdWithGroupRoleStringifier(inv);
      }),
      memberships: user.auth.memberships.map((mem) => {
        return IdWithGroupRoleStringifier(mem);
      }),
      shares: user.auth.shares.map((sh) => {
        return IdWithShareRoleStringifier(sh);
      }),
    },
  });
  return { message: "Invite accepted successfully" };
};

// ユーザー招待を拒否
export const rejectUserInviteHandler = async (
  c: Context,
  groupId: string,
): Promise<{ message: string }> => {
  const user = c.var.user;
  // 招待の存在確認
  const inviteIndex = user.auth.invites.findIndex(
    (invite) => invite.id === groupId,
  );
  if (inviteIndex === -1) {
    throw new HTTPException(404, { message: "Invite not found" });
  }
  // 招待を削除
  user.auth.invites.splice(inviteIndex, 1);
  // Firestoreのユーザーデータを更新
  await db().users.set(c.var.token.uid, {
    ...user,
    auth: {
      ...user.auth,
      invites: user.auth.invites.map((inv) => {
        return IdWithGroupRoleStringifier(inv);
      }),
      memberships: user.auth.memberships.map((mem) => {
        return IdWithGroupRoleStringifier(mem);
      }),
      shares: user.auth.shares.map((sh) => {
        return IdWithShareRoleStringifier(sh);
      }),
    },
  });
  return { message: "Invite rejected successfully" };
};

export const leaveGroupHandler = async (
  c: Context,
  groupId: string,
): Promise<{ message: string }> => {
  const user = c.var.user;
  // メンバーシップの存在確認
  const membershipIndex = user.auth.memberships.findIndex(
    (membership) => membership.id === groupId,
  );
  if (membershipIndex === -1) {
    throw new HTTPException(404, { message: "Membership not found" });
  }
  // メンバーシップを削除
  user.auth.memberships.splice(membershipIndex, 1);
  // Firestoreのユーザーデータを更新
  await db().users.set(c.var.token.uid, {
    ...user,
    auth: {
      ...user.auth,
      invites: user.auth.invites.map((inv) => {
        return IdWithGroupRoleStringifier(inv);
      }),
      memberships: user.auth.memberships.map((mem) => {
        return IdWithGroupRoleStringifier(mem);
      }),
      shares: user.auth.shares.map((sh) => {
        return IdWithShareRoleStringifier(sh);
      }),
    },
  });
  return { message: "Left group successfully" };
};

// グループからの共有を解除
export const leaveSharedByHandler = async (
  c: Context,
  groupId: string,
): Promise<{ message: string }> => {
  const user = c.var.user;
  // 共有の存在確認
  const shareIndex = user.auth.shares.findIndex(
    (share) => share.id === groupId,
  );
  if (shareIndex === -1) {
    throw new HTTPException(404, { message: "Share not found" });
  }

  // 共有を削除
  user.auth.shares.splice(shareIndex, 1);
  // Firestoreのユーザーデータを更新
  await db().users.set(c.var.token.uid, {
    ...user,
    auth: {
      ...user.auth,
      invites: user.auth.invites.map((inv) => {
        return IdWithGroupRoleStringifier(inv);
      }),
      memberships: user.auth.memberships.map((mem) => {
        return IdWithGroupRoleStringifier(mem);
      }),
      shares: user.auth.shares.map((sh) => {
        return IdWithShareRoleStringifier(sh);
      }),
    },
  });
  return { message: "Left shared by group successfully" };
};
