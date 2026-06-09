'use server';
 
import { AuthError } from 'next-auth';

import { signIn } from '@/src/auth.config';
import { to } from '@/src/core/utils';
 
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export const login = async (email: string, password: string) => {
  const [_, error] = await to(signIn('credentials', { email, password }));

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return { success: true };
};
