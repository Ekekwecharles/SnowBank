import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.accountNumber = (user as any).accountNumber;
        token.isRestricted = (user as any).isRestricted;
        token.isSuspended = (user as any).isSuspended;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).accountNumber = token.accountNumber;
        (session.user as any).isRestricted = token.isRestricted;
        (session.user as any).isSuspended = token.isSuspended;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET,
};
