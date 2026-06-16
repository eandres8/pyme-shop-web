'use server';

import { auth } from "@/src/auth.config";
import { userRepository } from "../../providers";
import { revalidatePath } from "next/cache";

export async function changeUserRole(userId: string, role: string) {
  const session = await auth();
        
  if (session?.user?.role !== 'admin') {
    return {
      success: false,
      message: "No es un usuario válido",
    };
  }

  const result = await userRepository.changeRole(userId, role);

  if (!result.isOk) {
    return {
      success: false,
      message: result.error.message,
    };
  }

  revalidatePath('/admin/users');

  return {
    success: true,
    data: result.data.toPublic(),
  };
}
