import { z } from "zod/v4";
import type { Context } from "../../apiRotuer";
import { generateRandomId } from "../../lib/randomId";
import { db } from "../../lib/firestore/firestore";
import getDefaultScoutData from "@b/lib/scoutDefaultData";
import { HTTPException } from "hono/http-exception";

export const ScoutCreateSchema = z.object({
  name: z.string().min(1).max(100),
  scoutId: z
    .string()
    .regex(/^\d{9,12}$/, { message: "Scout ID must be 9 to 12 digits" }),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" }),
  belongGroupId: z.string().min(1).max(50),
});

export type ScoutCreateSchemaType = z.infer<typeof ScoutCreateSchema>;
export const createScout = async (
  data: ScoutCreateSchemaType,
  c: Context
): Promise<{ id: string; message: string }> => {
  const role = c.var.user.fn.isInRoleOnGroup(data.belongGroupId, [
    "ADMIN",
    "EDIT",
  ]);

  if (!role) {
    throw new HTTPException(403, {
      message: "You do not have permission to create scout in this group",
    });
  }

  const duplicate = await db().scouts.lis(
    [
      { field: "belongGroupId", op: "==", value: data.belongGroupId },
      { field: "personal.scoutId", op: "==", value: data.scoutId },
    ],
    1,
  );
  if (duplicate.length > 0) {
    throw new HTTPException(409, {
      message: "同じ登録番号のスカウトが既に存在します",
    });
  }

  // 初期スカウトデータを構築
  const newScout = getDefaultScoutData(data);

  // ランダムなスカウトIDを生成(30文字)
  const id = generateRandomId(30);

  // データベースに保存(サービス層で権限チェックとFirestore操作を実行)
  await db().scouts.set(id, newScout);

  // 成功レスポンスを返却
  return {
    id,
    message: "Scout created successfully",
  };
};
