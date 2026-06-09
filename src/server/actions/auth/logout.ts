'use server';

import { signOut } from "@/src/auth.config";

export const logout = async () => {
  await signOut();
};