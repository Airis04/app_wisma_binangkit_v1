import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id_user: string;
    role: string;
    nama_lengkap: string;
  }

  interface Session {
    user: {
      id_user: string;
      role: string;
      nama_lengkap: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id_user: string;
    role: string;
    nama_lengkap: string;
  }
}
