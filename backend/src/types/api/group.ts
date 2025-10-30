import { z } from "zod";
import { GroupRoleSchema } from "../../lib/firestore/schemas";

export const GroupRole = GroupRoleSchema;
export type GroupRoleType = z.infer<typeof GroupRole>;
