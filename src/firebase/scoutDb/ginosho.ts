import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { FirestoreGinosho } from "../firebaseDataType/scouts/ginosho";
import { Ginosho } from "@/types/scout/ginosho";
import { getGinoshoDetail } from "@/types/master/ginosho";
import getObjectDiff from "@/tools/getObjectDiff";
import convertTimestampsDate from "../convertTimestampDate";
import { raiseError } from "@/errorHandler";

export const getGinosho = async (scoutId: string): Promise<Ginosho[]> => {
  const snapshot = await getDocs(
    query(collection(db, "scouts", scoutId, "ginosho"), limit(30))
  );

  const ginoshoList: Ginosho[] = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data() as FirestoreGinosho;

      const master = await getGinoshoDetail(data.id);
      if (!master) {
        raiseError(`技能章「${data.id}」のマスターデータが見つかりません。`);
      }

      return {
        id: doc.id, // IDはドキュメントのIDを使用
        unique: data.id, // 実質名前
        name: master?.name || "", // 技能章の名称
        date: convertTimestampsDate(data.date),
        certName: data.certName, // 技能章の考査員名
        cert: master?.cert || false, // 考査員認定か
        has: data.has, // 取得済みかどうか
        details: data.details.map((detail, index) => ({
          sort: index + 1,
          number:
            master?.details.find((d) => d.sort === index + 1)?.number || "",
          description:
            master?.details.find((d) => d.sort === index + 1)?.description ||
            "",
          has: detail.has,
          date: convertTimestampsDate(detail.date),
        })),
      };
    })
  );
  return ginoshoList;
};

export const setGinosho = async (
  scoutId: string,
  ginosho: Ginosho[]
): Promise<void> => {
  // Implementation for adding or updating a Ginosho document
  const prev = await getGinosho(scoutId);

  const newData = ginosho.filter((item) => {
    const p = prev.find((p) => p.id === item.id);
    return !p || getObjectDiff(item, p).length > 0;
  });

  const deletedData = prev.filter((item) => {
    return !ginosho.find((p) => p.id === item.id);
  });

  const bat = writeBatch(db);
  newData.forEach((g) => {
    const ginoshoRef = doc(db, "scouts", scoutId, "ginosho", g.id);
    const data: FirestoreGinosho = {
      id: g.unique,
      has: g.has,
      date: g.date,
      certName: g.certName,
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
