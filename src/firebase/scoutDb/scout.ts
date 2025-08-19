import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { raiseError } from "@/errorHandler";
import { Scout } from "@/types/scout/scout";

import { FirestoreScout } from "../firebaseDataType/scouts/scout";
import convertTimestampsDate from "../convertTimestampDate";

// Firebaseからスカウトデータを取得する関数
export const getScoutData = async (scoutId: string): Promise<Scout | null> => {
  console.log("getScoutData called with scoutId:", scoutId);
  try {
    const scoutRef = doc(db, "scouts", scoutId);
    const scoutDoc = await getDoc(scoutRef);

    if (!scoutDoc.exists) {
      raiseError("スカウトの情報が見つかりませんでした。");
      return null;
    }

    const scoutData = convertTimestampsDate(scoutDoc.data()) as FirestoreScout;
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

/**
 * スカウトデータをFirestoreに保存する。
 * @param scout 保存するスカウトデータ。
 * @returns 保存処理の結果。成功またはエラー情報を含むオブジェクトを返す。
 */
export const setScoutRecord = async (
  scout: Scout
): Promise<
  | {
      status: "success";
      data: Scout;
    }
  | {
      status: "error";
      error: string;
    }
> => {
  try {
    const scoutRef = doc(db, "scouts", scout.id);

    // Scout本体の保存
    const scoutRecord: FirestoreScout = {
      personal: scout.personal,
      unit: scout.unit,
    };

    // Firestoreのドキュメントに保存
    await setDoc(scoutRef, scoutRecord);
    return { status: "success", data: scout };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    raiseError(`Error setting scout data: ${errorMessage}`);
    return { status: "error", error: errorMessage };
  }
};
