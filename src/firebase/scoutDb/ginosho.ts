import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { FirestoreGinosho } from "../firebaseDataType/scouts/ginosho";
import { Ginosho } from "@/types/scout/ginosho";
import convertTimestampsDate from "../convertTimestampDate";
import { getGinoshoMasterList } from "@/types/master/ginosho";

export const getGinosho = async (scoutId: string): Promise<Ginosho[]> => {
  const snapshot = await getDocs(
    query(collection(db, "scouts", scoutId, "ginosho"), limit(30))
  );

  const master = await getGinoshoMasterList();

  const ginoshoList = snapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreGinosho;
    return {
      id: doc.id, // IDはドキュメントのIDを使用
      unique: data.id, // 実質名前
      date: convertTimestampsDate(data.date),
      certName: data.certName, // 技能章の考査員名
      cert: master.find((item) => item.id === data.id)?.cert || false, // 考査員認定か
      has: data.has, // 取得済みかどうか
      details: data.details,
      name: master.find((item) => item.id === data.id)?.name || "",
    };
  });
  return ginoshoList;
};

export const setGinosho = async (
  scoutId: string,
  ginosho: Ginosho,
  id: string
): Promise<void> => {
  // Implementation for adding or updating a Ginosho document

  const ginoshoRef = doc(db, "scouts", scoutId, "ginosho", id);

  const data: FirestoreGinosho = {
    id: ginosho.unique,
    date: ginosho.date,
    certName: ginosho.certName,
    has: ginosho.has,
    details: ginosho.details,
  };

  await setDoc(ginoshoRef, data);
};
