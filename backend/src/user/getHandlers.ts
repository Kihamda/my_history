import type { Context } from "@b/apiRotuer";
import { createTtlCache } from "@b/lib/cache";
import type { UserProfileType } from "./apiType";
import { db } from "@b/lib/firestore/firestore";

const GROUP_CACHE_TTL_MS = 1000 * 60 * 5;
const groupNameCache = createTtlCache<string, string>(GROUP_CACHE_TTL_MS);
const scoutNameCache = createTtlCache<string, string>(GROUP_CACHE_TTL_MS);

/**
 * グループ情報を含む完全なユーザープロファイルを取得
 */
export const getUserHandler = async (c: Context): Promise<UserProfileType> => {
  const user = c.var.user;
  const token = c.var.token;

  const groups: string[] = [];
  // ユーザーの所属グループ情報を取得
  user.auth.memberships.forEach((membership) => {
    groups.push(membership.id);
  });
  user.auth.invites.forEach((invite) => {
    groups.push(invite.id);
  });
  // グループ名をキャッシュ優先で取得
  const uniqueGroups = Array.from(new Set(groups));
  const groupNameMap = new Map<string, string>();
  const { hit, miss } = groupNameCache.getMany(uniqueGroups);

  // キャッシュヒット分をマップにセット
  hit.forEach((name, id) => {
    groupNameMap.set(id, name);
  });

  // キャッシュミス分をFirestoreから取得してマップとキャッシュにセット
  if (miss.length > 0) {
    const fetchedGroups = await db().groups.lis(
      [{ field: "doc_id", op: "in", value: miss }],
      miss.length,
    );
    fetchedGroups.forEach((g) => {
      const name = g.userSettings.name;
      groupNameMap.set(g.doc_id, name);
      groupNameCache.set(g.doc_id, name);
    });
  }

  // 共有されたスカウトの名前もキャッシュ優先で取得
  const uniqueScoutIds = Array.from(new Set(user.auth.shares.map((s) => s.id)));
  const scoutNameMap = new Map<string, string>();
  const { hit: scoutHit, miss: scoutMiss } =
    scoutNameCache.getMany(uniqueScoutIds);

  // キャッシュヒット分をマップにセット
  scoutHit.forEach((name, id) => {
    scoutNameMap.set(id, name);
  });
  // キャッシュミス分をFirestoreから取得してマップとキャッシュにセット
  if (scoutMiss.length > 0) {
    const fetchedScouts = await db().scouts.lis(
      [{ field: "doc_id", op: "in", value: scoutMiss }],
      scoutMiss.length,
    );
    fetchedScouts.forEach((scout) => {
      const name = scout.personal.name;
      scoutNameMap.set(scout.doc_id, name);
      scoutNameCache.set(scout.doc_id, name);
    });
  }

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
        return {
          id: membership.id,
          name: groupNameMap.get(membership.id) ?? "不明なグループ",
          role: membership.role,
        };
      }),

      // グループ名を含む招待情報を構築
      invites: user.auth.invites.map((invite) => {
        return {
          id: invite.id,
          name: groupNameMap.get(invite.id) ?? "不明なグループ",
          role: invite.role,
        };
      }),
      shares: user.auth.shares.map((share) => {
        return {
          id: share.id,
          role: share.role,
        };
      }),
      emailVerified: token.email_verified || false,
      acceptsInvite: user.auth.acceptsInvite || false,
      isGod: user.auth.isGod || false,
    },
  };

  return data;
};

type SharedScoutData = ReturnType<ReturnType<typeof db>["scouts"]["lis"]>;
export const getSharedScoutsHandler = async (
  c: Context,
  offset: number,
): Promise<SharedScoutData> => {
  const user = c.var.user;
  const sharedScoutIds = user.auth.shares
    .map((s) => s.id)
    .slice(offset, offset + 20);

  if (sharedScoutIds.length === 0) {
    return [];
  }

  const scouts = await db().scouts.lis(
    [{ field: "doc_id", op: "in", value: sharedScoutIds }],
    sharedScoutIds.length,
  );
  return scouts;
};
