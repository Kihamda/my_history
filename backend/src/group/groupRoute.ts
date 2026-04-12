/**
 * @fileoverview グループAPI ルーター
 *
 * このファイルの責務:
 * - グループ関連のHTTPエンドポイントの定義
 * - リクエストのルーティング
 * - バリデーションミドルウェアの適用
 * - ハンドラへの処理委譲
 *
 * エンドポイント一覧:
 * - GET    /:id                   - グループ取得
 * - POST   /:id/invites/create    - メンバー招待追加
 * - GET    /:id/members           - メンバー一覧取得
 * - DELETE /:id/members/:uid      - メンバー削除
 * - PUT    /:id/members/:uid/role - メンバーロール更新
 *
 * @module group/routes
 */

import { Hono } from "hono";
import type { AppContext } from "../apiRotuer";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod/v4";
import {
  addGroupInvite,
  removeGroupMember,
  updateMemberRole,
  getGroupMembers,
  getGroupInvitees,
  getGroupProfileData,
  updateGroupProfileData,
} from "./handler";
import { genIdSchema } from "@b/lib/randomId";

const CreateGroupInviteSchema = z.object({
  targetUid: genIdSchema,
  role: z.enum(["ADMIN", "EDIT", "VIEW"]),
});

const groupRouter = new Hono<AppContext>()
  /**
   * GET /:id - グループ取得
   *
   * パスパラメータ:
   * - id: グループID
   *
   * レスポンス: GroupRecordSchemaType
   * 権限: グループメンバー(ロール問わず)
   */
  .get(
    "/:id/profile",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const id = c.req.param("id");
      const group = await getGroupProfileData(id);
      return c.json(group);
    },
  )

  .post(
    "/:id/profile",
    zValidator("param", z.object({ id: z.string() })),
    zValidator("json", z.object({ name: z.string().max(100) })),
    async (c) => {
      const id = c.req.param("id");
      const { name } = c.req.valid("json");
      const group = await updateGroupProfileData(c, id, { name });
      return c.json(group);
    },
  )

  /**
   * POST /:id/invites/create - メンバー招待追加
   *
   * パスパラメータ:
   * - id: グループID
   *
   * リクエストボディ:
   * - userEmail: 追加するユーザーのメールアドレス
   * - role: 付与するロール(ADMIN/EDIT/VIEW)
   *
   * レスポンス: { message: string }
   * 権限: グループのADMINのみ
   */
  .post(
    "/:id/invites/create",
    zValidator("json", CreateGroupInviteSchema),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const id = c.req.valid("param").id;
      const invite = c.req.valid("json");
      await addGroupInvite(c, id, invite);
      return c.json({ message: "Member added successfully" });
    },
  )

  .get(
    "/:id/invites",
    zValidator(
      "query",
      z.object({
        offset: z.string().optional().default("0").transform(Number),
      }),
    ),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const id = c.req.valid("param").id;
      const offset = c.req.valid("query").offset;
      const invitees = await getGroupInvitees(c, offset, id);
      return c.json({ invitees });
    },
  )

  /**
   * GET /:id/members - メンバー一覧取得
   *
   * パスパラメータ:
   */

  .get(
    "/:id/members",
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "query",
      z.object({
        offset: z.string().optional().default("0").transform(Number),
      }),
    ),
    async (c) => {
      const id = c.req.param("id");
      const offset = c.req.valid("query").offset || 0;
      const group = await getGroupMembers(c, offset, id);
      return c.json({ members: group });
    },
  )

  /**
   * DELETE /:id/members/:uid - メンバー削除
   *
   * パスパラメータ:
   * - id: グループID
   * - uid: 削除対象のユーザーID
   *
   * レスポンス: { message: string }
   * 権限: グループのADMINのみ
   * 制限: 最後のADMINは削除不可
   */
  .delete("/:id/members/:uid", async (c) => {
    const id = c.req.param("id");
    const uid = c.req.param("uid");
    await removeGroupMember(c, id, uid);
    return c.json({ message: "Member removed successfully" });
  })

  /**
   * PUT /:id/members/:uid/role - メンバーロール更新
   *
   * パスパラメータ:
   * - id: グループID
   * - uid: 更新対象のユーザーID
   *
   * リクエストボディ:
   * - role: 新しいロール(ADMIN/EDIT/VIEW)
   *
   * レスポンス: { message: string }
   * 権限: グループのADMINのみ
   * 制限: 最後のADMINのロール変更は不可
   */
  .put(
    "/:id/members/:uid/role",
    zValidator("json", z.object({ role: z.enum(["ADMIN", "EDIT", "VIEW"]) })),
    async (c) => {
      const id = c.req.param("id");
      const uid = c.req.param("uid");
      const { role } = c.req.valid("json");
      await updateMemberRole(c, id, uid, role);
      return c.json({ message: "Member role updated successfully" });
    },
  );

export default groupRouter;
