import { z } from "zod/v4";

export const generateRandomId = (length = 30) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const genIdSchema = z
  .string()
  .min(1)
  .max(100)
  .refine((val) => /^[A-Za-z0-9_-]+$/.test(val), {
    message:
      "Invalid ID format. Only alphanumeric characters, hyphens, and underscores are allowed.",
  });
