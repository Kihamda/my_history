import type { ISODateString } from "./common";

export type GroupStatus = "active" | "inactive" | "suspended";

export interface GroupRecord {
  name: string;
  status: GroupStatus;
  updatedAt?: ISODateString;
}

export type GroupRole = "admin" | "edit" | "view";

export interface GroupMemberRecord {
  displayName: string;
  role: GroupRole;
  joinedAt?: ISODateString;
}

export interface CurrentGroupContext {
  id: string;
  name: string;
  isLeader: boolean;
  isAdmin: boolean;
  isEditable: boolean;
}
