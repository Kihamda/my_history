export interface FirestoreGroup {
  name: string;
  status: "ACTIVE" | "INACTIVE";
  members: FirestoreGroupMember[];
}

export interface FirestoreGroupMember {
  userEmail: string;
  role: "ADMIN" | "VIEW" | "EDIT";
}
