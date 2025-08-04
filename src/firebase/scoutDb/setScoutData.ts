import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { raiseError } from "@/errorHandler";
import { Scout } from "@/types/scout/scout";
import { ScoutRecord } from "../firebaseDataType/scouts/scoutRecord";

type SetScoutDataResult =
  | {
      status: "success";
      data: Scout;
    }
  | {
      status: "error";
      error: string;
    };

/**
 * スカウトデータをFirestoreに保存する。
 *
 * 指定されたスカウトデータをそのままFirestoreに保存する。
 * 競合検出やマージ処理は行わない。
 *
 * @param scout 保存するスカウトデータ。
 * @returns 保存処理の結果。成功またはエラー情報を含むオブジェクトを返す。
 */
const setScoutRecord = async (scout: Scout): Promise<SetScoutDataResult> => {
  try {
    await saveScoutToFirestore(scout);
    return { status: "success", data: scout };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    raiseError(`Error setting scout data: ${errorMessage}`);
    return { status: "error", error: errorMessage };
  }
};

/**
 * スカウトデータをFirestoreに保存する
 */
const saveScoutToFirestore = async (scout: Scout): Promise<void> => {
  const scoutRef = doc(db, "scouts", scout.id);

  // Scout本体の保存
  const scoutRecord: ScoutRecord = {
    personal: scout.personal,
    units: scout.unit,
  };

  // Firestoreのドキュメントに保存
  await setDoc(scoutRef, scoutRecord);
};

export default setScoutRecord;
