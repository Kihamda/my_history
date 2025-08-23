import { ScoutEvent } from "@/types/scout/event";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
} from "firebase/firestore";
import { FirestoreScoutEvent } from "../firebaseDataType/scouts/event";
import convertTimestampsDate from "../convertTimestampDate";
import { db } from "../firebase";

export const getEvents = async (scoutId: string): Promise<ScoutEvent[]> => {
  const snapshot = await getDocs(
    query(collection(db, "scouts", scoutId, "events"), limit(30))
  );
  const eventList = snapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreScoutEvent;
    return {
      id: doc.id,
      title: data.title,
      start: convertTimestampsDate(data.start),
      end: convertTimestampsDate(data.end),
      description: data.description,
      type: data.type,
    };
  });
  return eventList;
};

export const setEvents = async (
  scoutId: string,
  event: ScoutEvent
): Promise<void> => {
  // Implementation for adding or updating an Event document

  const eventRef = doc(db, "scouts", scoutId, "events", event.id);

  const data: FirestoreScoutEvent = {
    title: event.title,
    start: event.start,
    end: event.end,
    description: event.description,
    type: event.type,
  };

  await setDoc(eventRef, data);
};
