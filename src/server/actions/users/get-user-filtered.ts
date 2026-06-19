'use server';

import { auth } from "@/src/auth.config";
import { inject } from "../../providers";
import type { IUserRepository } from "../../interfaces";
import type { TActionResponse, TPublicUser } from "@/src/core/types";

function getUserFilteredAction(userRepository: IUserRepository) {
  return async (tenant: string): Promise<TActionResponse<TPublicUser[]>> => {
    const session = await auth();
          
    if (session?.user?.role !== 'admin') {
      return {
        success: false,
        message: "No es un usuario válido",
      };
    }

    const result = await userRepository.findByTenant(tenant);

    if (!result.isOk) {
      return {
        success: false,
        message: result.error.message,
      };
    }

    return {
      success: true,
      data: result.data.map((u) => u.toPublic()),
    };
  }
}

export const getUserFiltered = getUserFilteredAction(inject("userRepository") as IUserRepository);
