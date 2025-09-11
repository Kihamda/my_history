import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { raiseError } from "@/errorHandler";
import { Scout } from "@/types/scout/scout";

import {
  FirestoreScout,
  UnitExperience as UnitExperienceFirestore,
} from "../firebaseDataType/scouts/scout";
import convertTimestampsDate from "../convertTimestampDate";
import {
  ScoutUnitGrade,
  ScoutUnitNameMap,
  UnitExperience,
} from "@/types/scout/scoutUnit";
import { getGradeMasterList } from "@/types/master/grade";
import { getOptedUnitDataDefault } from "@/types/scout/scoutUnit";
import { getGinosho } from "./ginosho";
import { getEvents } from "./event";

// Firebaseからスカウトデータを取得する関数
export const getScoutData = async (scoutId: string): Promise<Scout | null> => {
  try {
    const scoutRef = doc(db, "scouts", scoutId);
    const scoutDoc = await getDoc(scoutRef);

    if (!scoutDoc.exists) {
      raiseError("スカウトの情報が見つかりませんでした。");
      return null;
    }

    const scoutData = convertTimestampsDate(scoutDoc.data()) as FirestoreScout;

    // unitの中身に名前を追加する
    // unitにマスターデータ適用
    const gradeMaster = await getGradeMasterList();
    const newUnit: UnitExperience[] = scoutData.unit.map(
      (unit): UnitExperience => ({
        ...unit,
        name: ScoutUnitNameMap[unit.id],
        grade: unit.grade.map(
          (g) =>
            ({
              ...g,
              name:
                gradeMaster.find((grade) => grade.id === g.id)?.name || g.id,
            } as ScoutUnitGrade)
        ),
      })
    );

    const ginoshoData = await getGinosho(scoutId);
    const eventsData = await getEvents(scoutId);

    return {
      id: scoutDoc.id,
      personal: scoutData.personal,
      unit: newUnit,
      ginosho: ginoshoData,
      events: eventsData,
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

    const unit: UnitExperienceFirestore[] = (
      await getOptedUnitDataDefault()
    ).map((u) => {
      const tmp = scout.unit.find((item) => item.id === u.id);
      if (tmp) {
        return {
          id: u.id,
          joinedDate: tmp.joinedDate,
          experienced: tmp.experienced,
          works: tmp.works,
          grade: u.grade.map((work) => {
            const found = tmp.grade.find((w) => w.id === work.id);
            if (!found) {
              return {
                id: work.id,
                has: false,
                date: work.date,
              };
            }
            return {
              id: found.id,
              has: found.has,
              date: found.date,
            };
          }),
        };
      } else {
        return u; // デフォルトのデータを使用
      }
    });
    // Scout本体の保存
    const scoutRecord: FirestoreScout = {
      personal: scout.personal,
      unit: unit,
    };

    //tst

    // Firestoreのドキュメントに保存
    await setDoc(scoutRef, scoutRecord);
    return { status: "success", data: scout };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    raiseError(`Error setting scout data: ${errorMessage}`);
    return { status: "error", error: errorMessage };
  }
};
