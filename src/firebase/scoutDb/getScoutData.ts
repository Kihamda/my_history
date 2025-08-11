import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { raiseError } from "@/errorHandler";
import { Scout } from "@/types/scout/scout";

import { ScoutRecord } from "../firebaseDataType/scouts/scoutRecord";
import convertTimestampsDate from "../convertTimestampDate";

// Firebaseからスカウトデータを取得する関数
const getScoutData = async (scoutId: string): Promise<Scout | null> => {
  console.log("getScoutData called with scoutId:", scoutId);
  try {
    const scoutRef = doc(db, "scouts", scoutId);
    const scoutDoc = await getDoc(scoutRef);

    if (!scoutDoc.exists) {
      raiseError("スカウトの情報が見つかりませんでした。");
      return null;
    }

    const scoutData = convertTimestampsDate(scoutDoc.data()) as ScoutRecord;
    return {
      id: scoutDoc.id,
      personal: scoutData.personal,
      unit: scoutData.unit,
    };
  } catch (error) {
    raiseError("Error fetching scout data:");
    return null;
  }
};

export default getScoutData;
