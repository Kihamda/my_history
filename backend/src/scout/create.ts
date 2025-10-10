import { Context } from "../apiRotuer";
import { Scout, ScoutCreate } from "../types/api/scout";
import { FirestoreScout } from "../types/firestore/scout";

const createScout = async (c: Context) => {
  const data: ScoutCreate = await c.req.json();

  const validatedData: FirestoreScout = {
    name: data.name,
    scoutId: data.scoutId,
    birthDate: data.birthDate,
    joinedDate: data.joinedDate,
    belongGroupId: data.belongGroupId,
    currentUnitId: data.currentUnitId,
    memo: data.memo,
    declare: {
      date: null,
      place: "",
    },
    religion: {
      date: null,
      type: "",
    },
    faith: {
      date: null,
    },
  };

  const db = c.var.db;

  try {
    await db.collection("scouts").add(validatedData);
    return c.json({ message: "Scout created successfully" }, 201);
  } catch (error) {
    console.error("Error creating scout:", error);
    return c.json({ error: "Failed to create scout" }, 500);
  }
};

export default createScout;
