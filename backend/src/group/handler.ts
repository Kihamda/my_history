/**
 * @fileoverview グループAPI向けハンドラー(ビジネスロジック層)
 *
 * 現状のデータモデル
 * - Group ドキュメント: { name, status }
 * - メンバー/権限: User ドキュメント auth.memberships に "ROLE;groupId" 形式で保持
 * - 招待: User ドキュメント auth.invites に "ROLE;groupId" 形式で保持
 */

import { HTTPException } from "hono/http-exception";
import type { Context } from "../apiRotuer";
import { db } from "../lib/firestore/firestore";
import {
  IdWithGroupRoleParser,
  IdWithGroupRoleStringifier,
} from "../lib/firestore/schemas";
import { type GroupRoleSchemaType } from "../lib/scoutGroup";

/**
 *
 * グループのプロフィールを取得
 * @param offset
 * @param id
 * @returns
 */

export const getGroupProfileData = async (id: string) => {
  const group = await db().groups.get(id);
  if (!group) {
    throw new HTTPException(404, { message: "Group not found" });
  }
  return group.userSettings;
};

/**
 * グループ取得(認可付き)
 * - グループ自体の存在確認
 * - 呼び出しユーザーが memberships を持つか確認
 * - members 一覧を user コレクションから導出
 */
export const getGroupMembers = async (
  c: Context,
  offset: number,
  id: string,
): Promise<
  {
    uid: string;
    role: GroupRoleSchemaType;
    email: string;
    displayName: string;
    statusMessage: string;
  }[]
> => {
  if (!c.var.user.fn.isInRoleOnGroup(id, ["ADMIN"])) {
    throw new HTTPException(403, {
      message: "You do not have permission to access this group",
    });
  }

  const members = await db().users.lis(
    [
      {
        field: "auth.memberships",
        op: "array-contains-any",
        value: [`ADMIN;${id}`, `EDIT;${id}`, `VIEW;${id}`],
      },
    ],
    20,
    offset,
  );

  return members.map((user) => {
    return {
      uid: user.doc_id,
      role: IdWithGroupRoleParser(
        user.auth.memberships.find((m) => m.endsWith(`;${id}`))!,
      ).role,
      email: user.email,
      displayName: user.profile.displayName,
      statusMessage: user.profile.statusMessage,
    };
  });
};

/** 招待取得(認可付き)
 * - グループ自体の存在確認
 * - 呼び出しユーザーが memberships を持つか確認
 * - invites 一覧を user コレクションから導出
 */
export const getGroupInvitees = async (
  c: Context,
  offset: number,
  id: string,
): Promise<
  {
    uid: string;
    role: GroupRoleSchemaType;
    email: string;
    displayName: string;
    statusMessage: string;
  }[]
> => {
  if (!c.var.user.fn.isInRoleOnGroup(id, ["ADMIN"])) {
    throw new HTTPException(403, {
      message: "You do not have permission to access this group",
    });
  }
  const invites = await db().users.lis(
    [
      {
        field: "auth.invites",
        op: "array-contains-any",
        value: [`ADMIN;${id}`, `EDIT;${id}`, `VIEW;${id}`],
      },
    ],
    20,
    offset,
  );
  return invites.map((user) => {
    return {
      uid: user.doc_id,
      role: IdWithGroupRoleParser(
        user.auth.invites.find((m) => m.endsWith(`;${id}`))!,
      ).role,
      email: user.email,
      displayName: user.profile.displayName,
      statusMessage: user.profile.statusMessage,
    };
  });
};

/**
 * 招待追加(ADMIN)
 * - targetUid の user.auth.invites に "ROLE;groupId" を追加
 */
export const addGroupInvite = async (
  c: Context,
  groupId: string,
  invite: { targetUid: string; role: GroupRoleSchemaType },
): Promise<void> => {
  // 権限チェック(ADMIN必須)
  if (!c.var.user.fn.isInRoleOnGroup(groupId, ["ADMIN"])) {
    throw new HTTPException(403, {
      message: "You do not have permission to invite members to this group",
    });
  }

  const user = await db().users.get(invite.targetUid);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  if (!user.auth.acceptsInvite) {
    throw new HTTPException(403, { message: "User does not accept invites" });
  }

  // 重複チェック
  if (user.auth.memberships.some((v) => v.endsWith(`;${groupId}`))) {
    throw new HTTPException(409, { message: "User is already a member" });
  }

  if (user.auth.invites.some((v) => v.endsWith(`;${groupId}`))) {
    throw new HTTPException(409, { message: "Invite already exists" });
  }

  if (user.auth.invites.length >= 10) {
    throw new HTTPException(409, { message: "Invite limit reached" });
  }

  const inviteKey = IdWithGroupRoleStringifier({
    id: groupId,
    role: invite.role,
  });

  await db().users.set(invite.targetUid, {
    ...user,
    auth: {
      ...user.auth,
      invites: [...user.auth.invites, inviteKey],
    },
  });
};

/**
 * メンバー削除(ADMIN)
 * - targetUid の user.auth.memberships から groupId を削除
 * - 最後の ADMIN を削除しようとしたら拒否
 */
export const removeGroupMember = async (
  c: Context,
  groupId: string,
  targetUid: string,
): Promise<void> => {
  // 認可
  if (!c.var.user.fn.isInRoleOnGroup(groupId, ["ADMIN"])) {
    throw new HTTPException(403, {
      message: "You do not have permission to remove members from this group",
    });
  }

  if (c.var.token.uid === targetUid) {
    throw new HTTPException(400, {
      message: "You cannot remove yourself from the group",
    });
  }

  const user = await db().users.get(targetUid);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  const newMemberships = user.auth.memberships.filter(
    (m) => !m.endsWith(`;${groupId}`),
  );

  await db().users.set(targetUid, {
    ...user,
    auth: {
      ...user.auth,
      memberships: newMemberships,
    },
  });
};

/**
 * ロール更新(ADMIN)
 * - targetUid の user.auth.memberships 内の該当要素を差し替え
 * - 最後の ADMIN を降格させようとしたら拒否
 */
export const updateMemberRole = async (
  c: Context,
  groupId: string,
  targetUid: string,
  role: GroupRoleSchemaType,
): Promise<void> => {
  // 認可
  if (!c.var.user.fn.isInRoleOnGroup(groupId, ["ADMIN"])) {
    throw new HTTPException(403, {
      message:
        "You do not have permission to update member roles in this group",
    });
  }

  if (c.var.token.uid === targetUid) {
    throw new HTTPException(400, {
      message: "You cannot change your own role",
    });
  }

  const user = await db().users.get(targetUid);
  const idx = user?.auth.memberships.findIndex((m) =>
    m.endsWith(`;${groupId}`),
  );
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }
  if (idx === undefined || idx < 0) {
    throw new HTTPException(404, {
      message: "User is not a member of the group",
    });
  }

  const nextMemberships = [...user.auth.memberships];
  nextMemberships[idx] = IdWithGroupRoleStringifier({
    id: groupId,
    role: role,
  });

  await db().users.set(targetUid, {
    ...user,
    auth: {
      ...user.auth,
      memberships: nextMemberships,
    },
  });
};
