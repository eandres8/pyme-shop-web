"use server";

import { User } from "@/src/core/entities";
import { userRepository } from "../../providers";
import type { TActionResponse, TPublicUser } from "@/src/core/types";

type TNewUser = { name: string; email: string; password: string };

export async function registerUser(data: TNewUser): Promise<TActionResponse<TPublicUser>> {
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
}
