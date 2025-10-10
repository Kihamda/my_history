import { Hono } from "hono";
import { UserProfile } from "../types/api/user";
import { AppContext } from "../apiRotuer";
import { FirestoreUser } from "../types/firestore/user";
import { FirestoreGroup } from "../types/firestore/group";

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

    const userData: UserProfile = {
      uid: token.uid,
      email: token.email || "",
      displayName: usertmp.displayName,
      knowGroupId: usertmp.knowGroupId || [],
      joinedGroup: {
        id: usertmp.joinedGroupId || "",
        name: group?.name || "",
        role: "ADMIN", // TODO: 役割の取得 (FirestoreGroupMemberから取得するなど
      },
      emailVerified: token.email_verified || false,
    };
    return c.json(userData);
  });

export default userRouter;
