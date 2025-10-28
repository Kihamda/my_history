import { Context } from "hono";
import { ScoutRecordSchemaType } from "../lib/firestore/scoute";

export const getScout = async (id: string, c: Context) => {
  const db = c.var.db;
  const doc = (
    await db.collection("scouts").doc(id).get()
  ).data() as unknown as ScoutRecordSchemaType;
  if (!doc) {
    return c.notFound();
  }
  return c.json(doc);
};
