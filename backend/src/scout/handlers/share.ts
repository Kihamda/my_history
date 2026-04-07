import { db } from "@b/lib/firestore/firestore";
import type { ShareRoleSchemaType } from "@b/lib/scoutGroup";
import { HTTPException } from "hono/http-exception";

export const createShareHandler = async (
  scoutId: string,
  role: ShareRoleSchemaType,
  targetUserId: string,
) => {
  const user = await db().users.get(targetUserId);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  if (user.auth.shares?.filter((id) => id.endsWith(scoutId)).length) {
    throw new HTTPException(400, { message: "すでに共有されています" });
  }

  const newUser = {
    ...user,
    auth: {
      ...user.auth,
      shares: [...(user.auth.shares || []), `${role};${scoutId}`],
    },
  };

  console.log("Creating share:", {
    targetUserId,
    scoutId,
    role,
    newUser,
    newShares: newUser.auth.shares,
  });
  await db().users.set(targetUserId, newUser);
};

export const deleteShareHandler = async (
  scoutId: string,
  targetUserId: string,
) => {
  const user = await db().users.get(targetUserId);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  if (!user.auth.shares?.filter((id) => id.endsWith(scoutId)).length) {
    throw new HTTPException(400, { message: "共有されていません" });
  }

  const newUser = {
    ...user,
    auth: {
      ...user.auth,
      shares: user.auth.shares?.filter((id) => !id.endsWith(scoutId)),
    },
  };
  await db().users.set(targetUserId, newUser);
};

export const getSharesHandler = async (scoutId: string) => {
  const users = await db().users.lis(
    [
      {
        field: "auth.shares",
        op: "array-contains-any",
        value: [`VIEW;${scoutId}`, `EDIT;${scoutId}`],
      },
    ],
    10,
  );

  return users.map((u) => ({
    id: u.doc_id,
    // 共有のロールは "VIEW" or "EDIT" のはずなので、どちらかを判定して返す
    // role: u.auth.shares?.find((id) => id.endsWith(scoutId))?.includes("EDIT")
    //   ? "EDIT"
    //   : "VIEW",
    // VIEWしか使わないので、ロールは返さない（暫定）
    name: u.profile.displayName,
    email: u.email,
  }));
};
