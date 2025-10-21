import { Context } from "../../apiRotuer";
import { ScoutType } from "../../types/api/scout";

type Detail = Date | null;

type FirestoreScout = {
  personal: FirestoreScoutPersonal;
  units: FirestoreScoutUnit[];
  ginoshos: ScoutGinosho[];
  events: ScoutEvent[];
};

// 個人情報のデータ これに
type FirestoreScoutPersonal = {
  name: string;
  scoutId: string;
  birthDate: Date;
  joinedDate: Date;
  belongGroupId: string;
  currentUnitId: "bvs" | "cs" | "bs" | "vs" | "rs" | "ob";
  memo: string;
  declare: {
    date: Date | null;
    place: string;
  };
  religion: {
    date: Date | null;
    type: string;
  };
  faith: {
    date: Date | null;
  };
};

type FirestoreScoutUnit = {
  uniqueId: "bvs" | "cs" | "bs" | "vs" | "rs";
  joinedDate: Date;
  work: ScoutUnitWork[];
  grade: ScoutUnitGrade[];
};

type ScoutUnitWork = {
  name: string;
  begin: Date;
  end?: Date;
};

type ScoutUnitGrade = {
  uniqueId: string;
  joinedDate: Date;
  details: Detail[];
};

type ScoutGinosho = {
  uniqueId: string;
  certBy: string;
  achievedDate: Date | null;
  details: Detail[];
};

// 行事章のデータ
type ScoutEvent = {
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
};

const getScoutData = async (id: string, c: Context): Promise<ScoutType> => {
  const data = (
    await c.var.db.collection("scouts").doc(id).get()
  ).data() as FirestoreScout;

  return {
    personal: data.personal,
    units: data.units,
    ginoshos: data.ginoshos,
    events: data.events,
  };
};
