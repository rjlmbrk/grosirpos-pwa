"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, getSession } from "@/lib/auth";
import { loginSchema } from "@/schemas";

export async function login(_prevState: unknown, formData: FormData) {
  const raw = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Username dan password harus diisi" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: parsed.data.username },
    });

    if (!user) {
      return { error: "Username atau password salah" };
    }

    const valid = await verifyPassword(parsed.data.password, user.password);
    if (!valid) {
      return { error: "Username atau password salah" };
    }

    const token = signToken({
      userId: user.id.toString(),
      username: user.username,
      role: user.role,
      nama: user.nama,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  } catch {
    return { error: "Terjadi kesalahan server" };
  }

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

export async function checkAuth() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
