import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";

import { authConfig } from "./auth.config";
import prisma from "./lib/prisma";

const credentialsSchema = z.object({
  email: z.email().max(30),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata Sandi", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.role !== "admin") return null;

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) return null;

        return {
          id: user.id_user,
          id_user: user.id_user,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
          foto_profil: user.foto_profil,
          role: user.role,
        };
      },
    }),
  ],
});
