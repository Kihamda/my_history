import z from "zod";
import { Context } from "../apiRotuer";
import {
  CurrentUnitId,
  ScoutRecordSchema,
  ScoutRecordSchemaType,
} from "../lib/firestore/scoute";
import { generateRandomId } from "../lib/randomId";

export const ScoutCreateSchema = z.object({
  name: z.string().min(1).max(100),
  scoutId: z.string().min(1).max(100),
  birthDate: z.date(),
  joinedDate: z.date(),
  belongGroupId: z.string().min(1).max(100),
  currentUnitId: CurrentUnitId,
  memo: z.string().max(500),
});
export type ScoutCreateSchemaType = z.infer<typeof ScoutCreateSchema>;

export const createScout = async (data: ScoutCreateSchemaType, c: Context) => {
  const db = c.var.db;

  const newScout: ScoutRecordSchemaType = {
    authedIds: [],
    personal: {
      name: data.name,
      scoutId: data.scoutId,
      birthDate: data.birthDate,
      joinedDate: data.joinedDate,
      belongGroupId: data.belongGroupId,
      currentUnitId: data.currentUnitId,
      memo: data.memo,
      declare: {
        date: new Date(0),
        place: "",
        done: false,
      },
      religion: {
        date: new Date(data.birthDate),
        type: "",
        done: false,
      },
      faith: {
        date: new Date(0),
        done: false,
      },
    },
    unit: {
      bvs: { experienced: false, joinedDate: new Date(0), work: [], grade: [] },
      cs: { experienced: false, joinedDate: new Date(0), work: [], grade: [] },
      bs: { experienced: false, joinedDate: new Date(0), work: [], grade: [] },
      vs: { experienced: false, joinedDate: new Date(0), work: [], grade: [] },
      rs: { experienced: false, joinedDate: new Date(0), work: [], grade: [] },
    },
    ginosho: [],
    event: [],
    last_Edited: new Date(),
  };

  ScoutRecordSchema.parse(newScout);

  const response = await db
    .collection("scouts")
    .doc(generateRandomId(30))
    .set(newScout);
  return response;
};
