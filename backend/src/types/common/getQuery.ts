import z from "zod";

export const IdSchema = z.object({
  id: z.string(),
});
export type IdType = z.infer<typeof IdSchema>;
