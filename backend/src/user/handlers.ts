import { Context } from "../apiRotuer";
import { UserRecordSchemaType } from "../lib/firestore/schemas";
import {
  createUser,
  updateCurrentUser,
  deleteCurrentUser,
} from "./services/userService";

export const createUserHandler = async (
  c: Context,
  data: UserRecordSchemaType
): Promise<{ message: string }> => {
  await createUser(c, data);
  return { message: "User created successfully" };
};

export const updateUserHandler = async (
  c: Context,
  data: Partial<UserRecordSchemaType>
): Promise<{ message: string }> => {
  await updateCurrentUser(c, data);
  return { message: "User updated successfully" };
};

export const deleteUserHandler = async (
  c: Context
): Promise<{ message: string }> => {
  await deleteCurrentUser(c);
  return { message: "User deleted successfully" };
};
