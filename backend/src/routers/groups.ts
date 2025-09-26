import { Hono } from "hono";
import { FirebaseAuthError } from "../firebase";
import { requireAuth, type AppVariables } from "../middleware/auth";
import type { AppBindings } from "../types/bindings";
import {
  getCurrentGroupContext,
  getGroupRecord,
} from "../repositories/groupsRepository";
import { getUserSettings } from "../repositories/usersRepository";

// 団情報の取得系エンドポイントをまとめたルーター。
const groupsRouter = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>()

  // すべてのリクエストで認証済みユーザーのみを許可する。
  .use("*", requireAuth)

  // ユーザー設定の joinGroupId を基に現在所属する団体情報を返す。
  .get("/current", async (c) => {
    const auth = c.get("auth");
    const settings = await getUserSettings(c.env, auth.token, auth.user);
    const context = await getCurrentGroupContext(
      c.env,
      auth.token,
      settings.joinGroupId,
      auth.user.email
    );

    if (!context) {
      return c.json(
        {
          group: null,
          joinGroupId: settings.joinGroupId ?? null,
        },
        404
      );
    }

    return c.json({
      group: context,
      joinGroupId: settings.joinGroupId,
    });
  })

  // URL 上の団体 ID に一致する情報を取得する。
  .get("/:groupId", async (c) => {
    const groupId = c.req.param("groupId");
    if (!groupId) {
      throw new FirebaseAuthError(
        "GROUP_ID_REQUIRED",
        400,
        "GROUP_ID_REQUIRED"
      );
    }

    const auth = c.get("auth");
    const settings = await getUserSettings(c.env, auth.token, auth.user);

    // 現在参加中の団体以外へのアクセスは拒否する。
    if (settings.joinGroupId !== groupId) {
      throw new FirebaseAuthError("GROUP_FORBIDDEN", 403, "GROUP_FORBIDDEN");
    }

    const group = await getGroupRecord(c.env, auth.token, groupId);

    if (!group) {
      return c.json(
        {
          error: "GROUP_NOT_FOUND",
        },
        404
      );
    }

    return c.json({
      id: groupId,
      ...group,
    });
  });

export default groupsRouter;
