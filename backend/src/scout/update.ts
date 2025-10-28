import z from "zod";
import { Context } from "../apiRotuer";
import {
  ScoutRecordSchema,
  ScoutRecordSchemaType,
} from "../lib/firestore/scoute";

export const updateScoutSchema = z.object({
  old: ScoutRecordSchema,
  new: ScoutRecordSchema,
});

const updateScout = async (
  id: string,
  scout: z.infer<typeof updateScoutSchema>,
  c: Context
) => {
  const db = c.var.db;

  const before = (
    await db.collection("scouts").doc(id).get()
  ).data() as unknown as ScoutRecordSchemaType;

  const response = await db.collection("scouts").doc(id).update(after);
  return response;
};

export default updateScout;
