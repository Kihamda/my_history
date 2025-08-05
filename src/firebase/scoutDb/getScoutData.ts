import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { raiseError } from "@/errorHandler";
import { AuthedUser, Scout } from "@/types/scout/scout";
import { Work } from "@/types/scout/scoutUnit";

import { ScoutRecord } from "../firebaseDataType/scouts/scoutRecord";
import { AuthedUserRecord } from "../firebaseDataType/scouts/authedUser";

// Firebaseからスカウトデータを取得する関数
const getScoutData = async (scoutId: string): Promise<Scout | null> => {
  try {
    const scoutRef = doc(db, "scouts", scoutId);
    const scoutDoc = await getDoc(scoutRef);

    if (!scoutDoc.exists) {
      raiseError("スカウトの情報が見つかりませんでした。");
      return null;
    }

    const scoutAuthedUser = collection(scoutRef, "authedUser");
    const authedUserSnapshot = await getDocs(scoutAuthedUser);

    const authedUsers = authedUserSnapshot.docs.map((doc) => {
      const data = doc.data() as AuthedUserRecord;
      const authed = {
        email: doc.id, // ドキュメントIDをメールアドレスとして使用
        displayName: data.displayName,
        role: data.role,
      } as AuthedUser;

      return authed;
    });

    const scoutWorks = collection(scoutRef, "works");
    const worksSnapshot = await getDocs(scoutWorks);

    const works: Work[] = worksSnapshot.docs.map((doc) => {
      const data = doc.data() as Work;
      return {
        type: data.type,
        begin: data.begin,
        end: data.end,
        memo: data.memo,
      } as Work;
    });

    const scoutData = scoutDoc.data() as ScoutRecord;
    return {
      id: scoutDoc.id,
      personal: scoutData.personal,
      unit: scoutData.unit,
      authedUser: authedUsers,
      works: works,
    } as Scout;
  } catch (error) {
    raiseError("Error fetching scout data:");
    return null;
  }
};

export default getScoutData;
