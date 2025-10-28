import { Hono } from "hono";
import { UserProfileType } from "../types/api/user";
import { AppContext } from "../apiRotuer";
import { FirestoreUser } from "../lib/firestore/user";
import { FirestoreGroup } from "../lib/firestore/group";

const userRouter = new Hono<AppContext>()

  // ルート (GET /user) は認証済みユーザーの情報を返す
  .get("/", async (c) => {
    const token = c.var.authToken;

    // ユーザの情報を取得
    const usertmp = (
      await c.var.db.collection("users").doc(token.uid).get()
    ).data() as FirestoreUser | undefined;

    if (!usertmp) {
      return c.body("User not found", 404);
    }

    //所属先を取得
    const groupRaw = await c.var.db
      .collection("groups")
      .doc(usertmp.joinedGroupId)
      .get();

    const group = groupRaw.data() as FirestoreGroup | undefined;

    const userDataOnGroup = group?.members.find(
      (m) => m.userEmail === token.email
    );

    const userData: UserProfileType = {
      uid: token.uid,
      email: token.email || "",
      displayName: usertmp.displayName,
      knowGroupId: usertmp.knowGroupId || [],
      joinedGroup: userDataOnGroup
        ? {
            id: usertmp.joinedGroupId || "",
            name: group?.name || "",
            role: userDataOnGroup.role,
          }
        : undefined,
      emailVerified: token.email_verified || false,
    };
    return c.json(userData);
  });

export default userRouter;
