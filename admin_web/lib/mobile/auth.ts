import jwt from "jsonwebtoken";

import prisma from "@/lib/prisma";
import { jsonError } from "./api-response";

export type MobileJwtPayload = {
  id_user: string;
  email: string;
  nama_lengkap: string;
  role: "tamu";
};

const TOKEN_EXPIRES_IN = "8h";

function getJwtSecret() {
  const secret =
    process.env.MOBILE_JWT_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "MOBILE_JWT_SECRET atau AUTH_SECRET wajib diisi untuk JWT mobile"
    );
  }

  return secret;
}

export function signMobileToken(payload: MobileJwtPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_EXPIRES_IN });
}

export function verifyMobileToken(token: string): MobileJwtPayload {
  const payload = jwt.verify(token, getJwtSecret());

  if (
    typeof payload !== "object" ||
    payload === null ||
    payload.role !== "tamu" ||
    typeof payload.id_user !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.nama_lengkap !== "string"
  ) {
    throw new Error("Token mobile tidak valid");
  }

  return {
    id_user: payload.id_user,
    email: payload.email,
    nama_lengkap: payload.nama_lengkap,
    role: "tamu",
  };
}

export function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length).trim();
}

export async function requireMobileUser(request: Request) {
  const token = readBearerToken(request);
  if (!token) {
    return {
      ok: false as const,
      response: jsonError("Token tidak ditemukan", 401),
    };
  }

  let payload: MobileJwtPayload;
  try {
    payload = verifyMobileToken(token);
  } catch {
    return {
      ok: false as const,
      response: jsonError("Token tidak valid atau sudah kedaluwarsa", 401),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id_user: payload.id_user },
    select: {
      id_user: true,
      nama_lengkap: true,
      email: true,
      no_telepon: true,
      role: true,
    },
  });

  if (!user || user.role !== "tamu") {
    return {
      ok: false as const,
      response: jsonError("Akun tamu tidak ditemukan", 401),
    };
  }

  return { ok: true as const, user };
}
