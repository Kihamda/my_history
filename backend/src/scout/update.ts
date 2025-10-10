import { Context } from "../apiRotuer";
import { Scout } from "../types/api/scout";
import { FirestoreScout } from "../types/firestore/scout";

const updateScout = async (c: Context) => {
  const data: Scout = await c.req.json();

  const validatedData: FirestoreScout = {};

  const db = c.var.db;
  const response = await db
    .collection("scouts")
    .doc(data.id)
    .update({ _id: data.id }, { $set: data });
  return response;
};

export default updateScout;
