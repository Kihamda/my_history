import { GroupRole } from "./group";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  joinedGroup?: {
    id: string;
    name: string;
    role: GroupRole;
  };
  knowGroupId: string[];
  emailVerified: boolean;
}
