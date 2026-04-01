import { db } from "@b/lib/firestore/firestore";
import { HTTPException } from "hono/http-exception";

export const createShareHandler = async (
  scoutId: string,
  targetUserId: string,
) => {
  const user = await db().users.get(targetUserId);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  if (user.auth.shares?.includes(scoutId)) {
    throw new HTTPException(400, { message: "すでに共有されています" });
  }

  const newUser = {
    ...user,
    auth: {
      ...user.auth,
      shares: [...(user.auth.shares || []), scoutId],
    },
  };
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

  if (!user.auth.shares?.includes(scoutId)) {
    throw new HTTPException(400, { message: "共有されていません" });
  }

  const newUser = {
    ...user,
    auth: {
      ...user.auth,
      shares: user.auth.shares?.filter((id) => id !== scoutId),
    },
  };
  await db().users.set(targetUserId, newUser);
};

export const getSharesHandler = async (scoutId: string) => {
  const users = await db().users.lis(
    [{ field: "auth.shares", op: "array-contains-any", value: [scoutId] }],
    10,
  );
  return users.map((u) => ({
    id: u.doc_id,
    name: u.profile.displayName,
    email: u.email,
  }));
};
