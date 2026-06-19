import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import {
  fetchUserByEmail,
  createUser,
} from "@/db/users/users.repo";

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      let existing = await fetchUserByEmail(user.email);

      if (!existing) {
        existing = await createUser({
          email: user.email,
          name: user.name ?? "",
          image: user.image ?? "",
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (token.email) {
        const dbUser = await fetchUserByEmail(token.email);

        if (dbUser) {
          token.userId = dbUser.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };