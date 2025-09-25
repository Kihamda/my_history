import { Hono } from "hono";
import { FirebaseAuthError } from "../firebase";
import { requireAuth, type AppVariables } from "../middleware/auth";
import type { AppBindings } from "../types/bindings";
import {
  getCurrentGroupContext,
  getGroupRecord,
} from "../repositories/groupsRepository";
import { getUserSettings } from "../repositories/usersRepository";

const groupsRouter = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

groupsRouter.use("*", requireAuth);

groupsRouter.get("/current", async (c) => {
  const auth = c.get("auth");
  const settings = await getUserSettings(c.env, auth.user);
  const context = await getCurrentGroupContext(
    c.env,
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
});

groupsRouter.get("/:groupId", async (c) => {
  const groupId = c.req.param("groupId");
  if (!groupId) {
    throw new FirebaseAuthError("GROUP_ID_REQUIRED", 400, "GROUP_ID_REQUIRED");
  }

  const auth = c.get("auth");
  const settings = await getUserSettings(c.env, auth.user);

  if (settings.joinGroupId !== groupId) {
    throw new FirebaseAuthError("GROUP_FORBIDDEN", 403, "GROUP_FORBIDDEN");
  }

  const group = await getGroupRecord(c.env, groupId);

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
