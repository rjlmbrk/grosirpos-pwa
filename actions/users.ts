"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/schemas";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";

export async function getUsers() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      nama: true,
      username: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({ ...u, id: Number(u.id) }));
}

export async function getUser(id: number) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nama: true,
      username: true,
      role: true,
    },
  });

  if (!user) return null;
  return { ...user, id: Number(user.id) };
}

export async function createUser(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const raw = {
    nama: formData.get("nama") as string,
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as string,
  };

  const parsed = userSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data user tidak valid" };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { username: parsed.data.username },
    });
    if (existing) {
      return { error: "Username sudah digunakan" };
    }

    if (!parsed.data.password) {
      return { error: "Password harus diisi" };
    }

    await prisma.user.create({
      data: {
        nama: parsed.data.nama,
        username: parsed.data.username,
        password: await hashPassword(parsed.data.password),
        role: parsed.data.role,
      },
    });
  } catch {
    return { error: "Gagal menyimpan user" };
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUser(
  id: number,
  _prevState: unknown,
  formData: FormData,
) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const password = formData.get("password") as string;

  const raw = {
    nama: formData.get("nama") as string,
    username: formData.get("username") as string,
    password: password || undefined,
    role: formData.get("role") as string,
  };

  const parsed = userSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data user tidak valid" };
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { username: parsed.data.username, NOT: { id } },
    });
    if (existing) {
      return { error: "Username sudah digunakan" };
    }

    const data: Record<string, unknown> = {
      nama: parsed.data.nama,
      username: parsed.data.username,
      role: parsed.data.role,
    };

    if (parsed.data.password) {
      data.password = await hashPassword(parsed.data.password);
    }

    await prisma.user.update({ where: { id }, data });
  } catch {
    return { error: "Gagal memperbarui user" };
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUser(id: number) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    return { error: "Gagal menghapus user" };
  }

  revalidatePath("/users");
}
