import type { Context } from "@b/apiRotuer";
import { db } from "./firestore/firestore";
import {
  IdWithGroupRoleParser,
  IdWithShareRoleParser,
} from "./firestore/schemas";

export interface UserDataContext {
  auth: {
    memberships: {
      id: string;
      role: "ADMIN" | "EDIT" | "VIEW";
    }[];
    invites: {
      id: string;
      role: "ADMIN" | "EDIT" | "VIEW";
    }[];
    shares: {
      id: string;
      role: "EDIT" | "VIEW";
    }[];
    isGod: boolean;
  };
  email: string;
  profile: {
    displayName: string;
    statusMessage: string;
    acceptsInvite: boolean;
  };
  fn: {
    isInRoleOnGroup: (
      groupId: string,
      role?: Array<"ADMIN" | "EDIT" | "VIEW">,
    ) => "ADMIN" | "EDIT" | "VIEW" | false;
  };
}

export const loadUserData = async (c: Context, next: () => Promise<void>) => {
  const token = c.var.token;
  // userDataを取得する
  const userData = await db().users.get(token.uid);
  if (!userData) {
    return c.json("USER_DATA_NOT_FOUND", 404);
  }
  const groups = userData.auth.memberships.map((m) => {
    const { id, role } = IdWithGroupRoleParser(m);
    return { id, role };
  });

  const invites = userData.auth.invites.map((m) => {
    const { id, role } = IdWithGroupRoleParser(m);
    return { id, role };
  });
  const shares = userData.auth.shares.map((m) => {
    const { id, role } = IdWithShareRoleParser(m);
    return { id, role };
  });

  const newUserData: UserDataContext = {
    ...userData,
    auth: {
      memberships: groups,
      invites: invites,
      shares: shares,
      isGod: userData.auth.isGod || false,
    },
    fn: {
      isInRoleOnGroup: (
        groupId: string,
        role: Array<"ADMIN" | "EDIT" | "VIEW"> = ["ADMIN", "EDIT", "VIEW"],
      ) => {
        const membership = groups.find(
          (m) => m.id === groupId && role.includes(m.role),
        )?.role;
        return membership ? membership : false;
      },
    },
  };

  c.set("user", newUserData);
  await next();
};
