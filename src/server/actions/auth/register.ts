"use server";

import { User } from "@/src/core/entities";
import { userRepository } from "../../providers";
import type { TPublicUser } from "@/src/core/types";

type TNewUser = { name: string; email: string; password: string };

type TResponseNewUser =
  | { success: false; message: string }
  | { success: true; data: TPublicUser };

export const registerUser = async (
  data: TNewUser,
): Promise<TResponseNewUser> => {
  const user = User.fromJson(data).cipherPass();

  const result = await userRepository.create(user);

  if (!result.isOk) {
    return {
      success: false,
      message: "No se pudo crear el usuario",
    };
  }

  return {
    success: true,
    data: result.data<User>().toPublic(),
  };
};
