/**
 * @fileoverview グループAPI ルーター
 *
 * このファイルの責務:
 * - グループ関連のHTTPエンドポイントの定義
 * - リクエストのルーティング
 * - バリデーションミドルウェアの適用
 * - サービス層への処理委譲
 *
 * エンドポイント一覧:
 * - GET    /:id                    - グループ取得
 * - POST   /                       - グループ作成
 * - PUT    /:id                    - グループ更新
 * - DELETE /:id                    - グループ削除
 * - POST   /:id/members            - メンバー追加
 * - DELETE /:id/members/:email     - メンバー削除
 * - PUT    /:id/members/:email/role - メンバーロール更新
 *
 * @module group/routes
 */

import { Hono } from "hono";
import { AppContext } from "../apiRotuer";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { GroupRecordSchema } from "../lib/firestore/schemas";
import {
  getGroupWithAuth,
  createGroup,
  updateGroupWithAuth,
  deleteGroupWithAuth,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
} from "./services/groupService";
import { generateRandomId } from "../lib/randomId";

// バリデーションスキーマ
const GroupCreateSchema = GroupRecordSchema.omit({ members: true });
const GroupMemberAddSchema = z.object({
  userEmail: z.string().email(),
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
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const group = await getGroupWithAuth(c, id);
    return c.json(group);
  })

  /**
   * POST / - グループ作成
   *
   * リクエストボディ:
   * - name: グループ名
   * - status: ステータス(ACTIVE/INACTIVE)
   *
   * レスポンス: { id: string, message: string }
   * 権限: 認証済みユーザー(作成者が自動的にADMINになる)
   */
  .post("/", zValidator("json", GroupCreateSchema), async (c) => {
    const data = c.req.valid("json");
    const id = generateRandomId(20);
    await createGroup(c, id, data);
    return c.json({ id, message: "Group created successfully" }, 201);
  })

  /**
   * PUT /:id - グループ更新
   *
   * パスパラメータ:
   * - id: グループID
   *
   * リクエストボディ: GroupRecordSchema.partial()
   *
   * レスポンス: { message: string }
   * 権限: グループのADMINのみ
   */
  .put("/:id", zValidator("json", GroupRecordSchema.partial()), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    await updateGroupWithAuth(c, id, data);
    return c.json({ message: "Group updated successfully" });
  })

  /**
   * DELETE /:id - グループ削除
   *
   * パスパラメータ:
   * - id: グループID
   *
   * レスポンス: { message: string }
   * 権限: グループのADMINのみ
   * 制限: メンバーが1人のみの場合のみ削除可能
   */
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await deleteGroupWithAuth(c, id);
    return c.json({ message: "Group deleted successfully" });
  })

  /**
   * POST /:id/members - メンバー追加
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
  .post("/:id/members", zValidator("json", GroupMemberAddSchema), async (c) => {
    const id = c.req.param("id");
    const member = c.req.valid("json");
    await addGroupMember(c, id, member);
    return c.json({ message: "Member added successfully" });
  })

  /**
   * DELETE /:id/members/:email - メンバー削除
   *
   * パスパラメータ:
   * - id: グループID
   * - email: 削除対象のメールアドレス
   *
   * レスポンス: { message: string }
   * 権限: グループのADMINのみ
   * 制限: 最後のADMINは削除不可
   */
  .delete("/:id/members/:email", async (c) => {
    const id = c.req.param("id");
    const email = c.req.param("email");
    await removeGroupMember(c, id, email);
    return c.json({ message: "Member removed successfully" });
  })

  /**
   * PUT /:id/members/:email/role - メンバーロール更新
   *
   * パスパラメータ:
   * - id: グループID
   * - email: 更新対象のメールアドレス
   *
   * リクエストボディ:
   * - role: 新しいロール(ADMIN/EDIT/VIEW)
   *
   * レスポンス: { message: string }
   * 権限: グループのADMINのみ
   * 制限: 最後のADMINのロール変更は不可
   */
  .put(
    "/:id/members/:email/role",
    zValidator("json", z.object({ role: z.enum(["ADMIN", "EDIT", "VIEW"]) })),
    async (c) => {
      const id = c.req.param("id");
      const email = c.req.param("email");
      const { role } = c.req.valid("json");
      await updateMemberRole(c, id, email, role);
      return c.json({ message: "Member role updated successfully" });
    }
  );

export default groupRouter;
