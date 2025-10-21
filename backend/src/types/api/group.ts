import { z } from "zod";

export const GroupRole = z.enum(["ADMIN", "VIEW", "EDIT"]);

type GroupRole = "ADMIN" | "VIEW" | "EDIT";
