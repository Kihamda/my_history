import { ScoutEventType } from "@/types/scout/event";

export interface FirestoreScoutEvent {
  title: string;
  start: Date;
  end: Date;
  description: string;
  type: ScoutEventType;
}
