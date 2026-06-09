import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from "bcryptjs";

import { userRepository } from "./server/providers";
import { User } from "./core/entities";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/new-account"
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const result = await userRepository.findByEmail(email.toLowerCase());

        if (!result.isOk) {
          return null;
        }

        const user = result.data<User>();

        if (!bcrypt.compareSync(password, user.password)) {
          return null;
        }

        return user.toPublic();
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { signIn, signOut, auth } = NextAuth(authConfig);
