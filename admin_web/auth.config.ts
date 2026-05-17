import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isOnLogin = pathname === "/login";
      const isOnRoot = pathname === "/";
      const isProtected =
        pathname.startsWith("/dasbor") ||
        pathname.startsWith("/pemesanan") ||
        pathname.startsWith("/unit") ||
        pathname.startsWith("/keuangan") ||
        pathname.startsWith("/pengaturan");

      if (isProtected) {
        return isLoggedIn;
      }

      if ((isOnLogin || isOnRoot) && isLoggedIn) {
        return Response.redirect(new URL("/dasbor", request.nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id_user = user.id_user;
        token.role = user.role;
        token.nama_lengkap = user.nama_lengkap;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id_user = token.id_user as string;
        session.user.role = token.role as string;
        session.user.nama_lengkap = token.nama_lengkap as string;
      }
      return session;
    },
  },
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
} satisfies NextAuthConfig;
