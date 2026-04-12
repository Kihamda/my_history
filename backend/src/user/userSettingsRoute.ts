import type { AppContext } from "@b/apiRotuer";
import { genIdSchema } from "@b/lib/randomId";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod/v4";
import {
  acceptUserInviteHandler,
  leaveGroupHandler,
  leaveSharedByHandler,
  rejectUserInviteHandler,
} from "./handlers";

const userSettingsRouter = new Hono<AppContext>()

  // ユーザー設定をすべてここでPOSTする

  .post(
    "/acceptInvite/:groupCode",
    zValidator("param", z.object({ groupCode: genIdSchema })),
    async (c) => {
      const { groupCode } = c.req.valid("param");
      const result = await acceptUserInviteHandler(c, groupCode);
      return c.json(result);
    },
  )

  .post(
    "/denyInvite/:groupCode",
    zValidator("param", z.object({ groupCode: genIdSchema })),
    async (c) => {
      const { groupCode } = c.req.valid("param");
      const result = await rejectUserInviteHandler(c, groupCode);
      return c.json(result);
    },
  )

  .post(
    "/leaveGroup/:groupId",
    zValidator(
      "param",
      z.object({
        groupId: genIdSchema,
      }),
    ),
    async (c) => {
      const groupId = c.req.valid("param").groupId;
      const result = await leaveGroupHandler(c, groupId);
      return c.json(result);
    },
  )

  .post(
    "/leaveSharedBy/:sharedById",
    zValidator(
      "param",
      z.object({
        sharedById: genIdSchema,
      }),
    ),
    async (c) => {
      const sharedById = c.req.valid("param").sharedById;
      const result = await leaveSharedByHandler(c, sharedById);
      return c.json(result);
    },
  );

export default userSettingsRouter;
