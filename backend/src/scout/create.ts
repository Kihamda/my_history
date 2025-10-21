import { Context } from "../apiRotuer";
import { FirestoreScout } from "../lib/firestore/scout";
import { generateRandomId } from "../lib/randomId";
import { ScoutCreateType } from "../types/api/scout";

const createScout = async (data: ScoutCreateType, c: Context) => {
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
  const id = generateRandomId();

  try {
    await db.collection("scouts").doc(id).set(validatedData);
    return c.json({ message: "Scout created successfully", id }, 201);
  } catch (error) {
    console.error("Error creating scout:", error);
    return c.json({ error: "Failed to create scout" }, 500);
  }
};

export default createScout;
