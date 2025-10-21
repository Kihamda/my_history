import { GroupRole } from "./group";
import { z } from "zod";

export const UserProfile = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  joinedGroup: z
    .object({
      id: z.string(),
      name: z.string(),
      role: GroupRole,
    })
    .optional(),
  knowGroupId: z.array(z.string()),
  emailVerified: z.boolean(),
});

export type UserProfileType = z.infer<typeof UserProfile>;
