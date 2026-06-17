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

      const existing = await fetchUserByEmail(user.email);

      if (!existing) {
        await createUser({
          email: user.email,
          name: user.name ?? "",
          image: user.image ?? "",
        });
      }

      return true;
    },
  },
});

export { handler as GET, handler as POST };