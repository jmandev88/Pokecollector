import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import {
  fetchUserByEmail,
  createUser,
} from "@/db/users/users.repo";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  events: {
    async signIn({ user }) {
      if (!user.email) return;

      const existing = await fetchUserByEmail(user.email);

      if (!existing) {
        await createUser({
          email: user.email,
          name: user.name ?? "",
          image: user.image ?? "",
        });
      }
    },
  },

  callbacks: {
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await fetchUserByEmail(token.email as string);

        if (dbUser) {
          token.userId = dbUser.id;
          token.name = dbUser.name;
          token.image = dbUser.image;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }

      return session;
    },
  },
});