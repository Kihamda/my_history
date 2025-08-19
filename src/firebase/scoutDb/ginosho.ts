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
import { Ginosho } from "@/types/scout/gionosho";
import convertTimestampsDate from "../convertTimestampDate";

export const getGinosho = async (scoutId: string): Promise<Ginosho[]> => {
  const snapshot = await getDocs(
    query(collection(db, "scouts", scoutId, "ginosho"), limit(30))
  );
  const ginoshoList = snapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreGinosho;
    return {
      id: doc.id, // IDはドキュメントのIDを使用
      unique: data.id, // 細目管理用
      name: data.name,
      date: convertTimestampsDate(data.date),
      description: data.memo,
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
    name: ginosho.name,
    memo: ginosho.description,
  };

  await setDoc(ginoshoRef, data);
};
