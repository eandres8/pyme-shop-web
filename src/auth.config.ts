import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from "bcryptjs";

import type { IUserRepository } from "./server/interfaces";
import { inject } from "./server/providers";

const userRepository = inject('userRepository') as IUserRepository;

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/new-account"
  },

  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.data = user;
      }

      return token;
    },

    session: ({ session, token }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session.user = token.data as any;
      return session;
    }
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

        const user = result.data;

        if (!bcrypt.compareSync(password, user.password)) {
          return null;
        }

        return user.toPublic();
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { signIn, signOut, auth, handlers } = NextAuth(authConfig);
