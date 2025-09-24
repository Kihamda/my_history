import { ScoutEvent } from "@/types/frontend/scout/event";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  writeBatch,
} from "firebase/firestore";
import { FirestoreScoutEvent } from "../firebaseDataType/scouts/event";
import convertTimestampsDate from "../convertTimestampDate";
import { db } from "../firebase";
import getObjectDiff from "@/tools/getObjectDiff";

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
  events: ScoutEvent[]
): Promise<void> => {
  // Implementation for adding or updating an Event document
  const prev = await getEvents(scoutId);
  const newData = events.filter((event) => {
    const found = prev.find((e) => e.id === event.id);
    return !found || getObjectDiff(found, event).length > 0;
  });

  const deletedData = prev.filter(
    (event) => !events.find((e) => e.id === event.id)
  );

  const bat = writeBatch(db);

  newData.forEach((event) => {
    const eventRef = doc(db, "scouts", scoutId, "events", event.id);
    bat.set(eventRef, event);
  });

  deletedData.forEach((event) => {
    const eventRef = doc(db, "scouts", scoutId, "events", event.id);
    bat.delete(eventRef);
  });

  await bat.commit();
};
