"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";

const registroSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto."),
  email: z.email("Email inválido."),
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones."),
  timezone: z.string().min(1, "Elegí una zona horaria."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export interface AuthFormState {
  error?: string;
}

export async function registrarUsuario(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registroSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { name, email, username, timezone, password } = parsed.data;

  const existente = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existente) {
    return { error: "Ese email o nombre de usuario ya está en uso." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: { name, email, username, timezone, passwordHash },
  });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  return {};
}

export async function iniciarSesion(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw error;
  }
}
