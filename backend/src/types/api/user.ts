export interface User {
  uid: string;
  email: string;
  displayName: string;
  joinedGroupId?: string;
  knowGroupId: string[];
  emailVerified: boolean;
}
