import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { getArrayDiff } from "@/tools/getObjectDiff";
import convertTimestampsDate from "../convertTimestampDate";
import { raiseError } from "@/errorHandler";
import { ScoutUnitGrade } from "@/types/scout/unit";
import { getGradeDetailMaster } from "@/types/master/grade";
import { ScoutUnitGradeFirestore } from "../firebaseDataType/scouts/unit";

export const getUnitWithGradeWork = async (
  id: string
): Promise<ScoutUnitGrade[]> => {
  const snapshot = await getDocs(
    query(collection(db, "scouts", id, "grades"), limit(30))
  );

  const gradeList: ScoutUnitGrade[] = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data() as ScoutUnitGradeFirestore;

      const master = await getGradeDetailMaster(data.unique);
      if (!master) {
        raiseError(`進級「${data.unique}」のマスターデータが見つかりません。`);
      }

      return {
        id: doc.id, // IDはドキュメントのIDを使用
        unique: data.unique, // 実質名前
        name: master?.name || "", // 進級の名称
        has: data.has, // 取得済みかどうか
        date: convertTimestampsDate(data.date),
        details: data.details.map((detail, index) => {
          const masterDetail = master?.details.find((d) => d.id === index + 1);
          return {
            id: masterDetail?.id || 0,
            number: masterDetail?.number || "",
            description: masterDetail?.description || "",
            has: detail.has,
            date: convertTimestampsDate(detail.date),
          };
        }),
      };
    })
  );
  return gradeList;
};

export const setUnit = async (
  scoutId: string,
  unit: ScoutUnitGrade[]
): Promise<void> => {
  // Implementation for adding or updating a UnitExperience document
  const prev = await getUnitWithGradeWork(scoutId);

  const [newData, deletedData] = getArrayDiff(unit, prev);

  const bat = writeBatch(db);
  newData.forEach((g) => {
    const ginoshoRef = doc(db, "scouts", scoutId, "ginosho", g.id);
    const data: ScoutUnitGradeFirestore = {
      unique: g.unique,
      has: g.has,
      date: g.date,
      details: g.details.map((detail) => ({
        has: detail.has,
        date: detail.date,
      })), // Firebaseには細目のマスターデータは保存しない
    };

    bat.set(ginoshoRef, data);
  });

  deletedData.forEach((g) => {
    const ginoshoRef = doc(db, "scouts", scoutId, "ginosho", g.id);
    bat.delete(ginoshoRef);
  });

  await bat.commit();
};
