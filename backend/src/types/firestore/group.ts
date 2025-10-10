export interface FirestoreGroup {
  name: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface FirestoreGroupMember {
  userId: string;
  role: "ADMIN" | "VIEW" | "EDIT";
}
