import { HTTPException } from "hono/http-exception";
import type { Context } from "../apiRotuer";
import { db } from "../lib/firestore/firestore";
import {
  IdWithGroupRoleStringifier,
  IdWithShareRoleStringifier,
  type UserRecordSchemaType,
} from "../lib/firestore/schemas";
import type { UserProfileType } from "./apiType";

/**
 * グループ情報を含む完全なユーザープロファイルを取得
 */
export const getUserHandler = async (c: Context): Promise<UserProfileType> => {
  const user = c.var.user;
  const token = c.var.token;

  let groups: string[] = [];
  // ユーザーの所属グループ情報を取得
  user.auth.memberships.forEach((membership) => {
    groups.push(membership.id);
  });
  user.auth.invites.forEach((invite) => {
    groups.push(invite.id);
  });

  if (groups.length === 0) {
    // 所属グループ/招待がない場合は空のデータを返す
    const data: UserProfileType = {
      uid: token.uid,
      email: token.email || "",
      profile: {
        displayName: user.profile.displayName,
        statusMessage: user.profile.statusMessage,
      },
      auth: {
        // グループ名を含むメンバーシップ情報を構築
        memberships: user.auth.memberships.map((membership) => {
          const groupData = group.find((g) => g.doc_id === membership.id);
          return {
            id: membership.id,
            name: groupData ? groupData.name : "不明なグループ",
            role: membership.role,
          };
        }),

        // グループ名を含む招待情報を構築
        invites: user.auth.invites.map((invite) => {
          const groupData = group.find((g) => g.doc_id === invite.id);
          return {
            id: invite.id,
            name: groupData ? groupData.name : "不明なグループ",
            role: invite.role,
          };
        }),

        // グループ名を含む共有情報を構築
        shares: user.auth.shares,
        emailVerified: token.email_verified || false,
      },
    };
    return data;
  }
  // グループデータを取得
  const group = await db().groups.lis(
    [{ field: "doc_id", op: "in", value: groups }],
    10
  );

  const data: UserProfileType = {
    uid: token.uid,
    email: token.email || "",
    profile: {
      displayName: user.profile.displayName,
      statusMessage: user.profile.statusMessage,
    },
    auth: {
      // グループ名を含むメンバーシップ情報を構築
      memberships: user.auth.memberships.map((membership) => {
        const groupData = group.find((g) => g.doc_id === membership.id);
        return {
          id: membership.id,
          name: groupData ? groupData.name : "不明なグループ",
          role: membership.role,
        };
      }),

      // グループ名を含む招待情報を構築
      invites: user.auth.invites.map((invite) => {
        const groupData = group.find((g) => g.doc_id === invite.id);
        return {
          id: invite.id,
          name: groupData ? groupData.name : "不明なグループ",
          role: invite.role,
        };
      }),

      // グループ名を含む共有情報を構築
      shares: user.auth.shares,
      emailVerified: token.email_verified || false,
    },
  };

  return data;
};

export const createUserHandler = async (
  c: Context,
  data: UserRecordSchemaType["profile"]
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
      acceptsInvite: true,
      isGod: false,
    },
  });

  return { message: "User created successfully" };
};

export const updateUserProfileHandler = async (
  c: Context,
  data: UserRecordSchemaType["profile"]
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
  c: Context
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
    [{ field: "email", op: "==", value: email }],
    10
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
  groupId: string
): Promise<{ message: string }> => {
  const user = c.var.user;
  // 招待の存在確認
  const inviteIndex = user.auth.invites.findIndex(
    (invite) => invite.id === groupId
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
