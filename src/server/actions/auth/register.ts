"use server";

import { User } from "@/src/core/entities";
import { inject } from "../../providers";
import type { TPublicUser } from "@/src/core/types";
import type { IUserRepository } from "../../interfaces";

type TNewUser = { name: string; email: string; password: string };

type TResponseNewUser =
  | { success: false; message: string }
  | { success: true; data: TPublicUser };

function registerUserAction(userRepository: IUserRepository) {
  return async (
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
      data: result.data.toPublic(),
    };
  };
}

export const registerUser = registerUserAction(inject("userRepository") as IUserRepository);
