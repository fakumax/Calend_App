"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const horaSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato de hora inválido (HH:MM).");

const reglaSchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: horaSchema,
    endTime: horaSchema,
  })
  .refine((r) => r.startTime < r.endTime, {
    message: "El horario de inicio debe ser antes que el de fin.",
    path: ["endTime"],
  });

export interface AvailabilityFormState {
  error?: string;
}

async function usuarioActual() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado.");
  return session.user.id;
}

export async function agregarRegla(
  _prevState: AvailabilityFormState,
  formData: FormData,
): Promise<AvailabilityFormState> {
  const userId = await usuarioActual();
  const parsed = reglaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  await db.availability.create({ data: { userId, ...parsed.data } });
  revalidatePath("/dashboard/disponibilidad");
  return {};
}

export async function eliminarRegla(id: string): Promise<void> {
  const userId = await usuarioActual();
  await db.availability.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard/disponibilidad");
}

const overrideSchema = z.object({
  date: z.string().min(1, "Elegí una fecha."),
  isAvailable: z.coerce.boolean(),
  startTime: horaSchema.optional().or(z.literal("")),
  endTime: horaSchema.optional().or(z.literal("")),
});

export async function agregarExcepcion(
  _prevState: AvailabilityFormState,
  formData: FormData,
): Promise<AvailabilityFormState> {
  const userId = await usuarioActual();
  const raw = Object.fromEntries(formData);
  const parsed = overrideSchema.safeParse({ ...raw, isAvailable: raw.isAvailable === "on" });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { date, isAvailable, startTime, endTime } = parsed.data;

  if (isAvailable && (!startTime || !endTime)) {
    return { error: "Indicá el horario para el día disponible." };
  }

  await db.availabilityOverride.upsert({
    where: { userId_date: { userId, date: new Date(date) } },
    create: {
      userId,
      date: new Date(date),
      isAvailable,
      startTime: isAvailable ? startTime : null,
      endTime: isAvailable ? endTime : null,
    },
    update: {
      isAvailable,
      startTime: isAvailable ? startTime : null,
      endTime: isAvailable ? endTime : null,
    },
  });
  revalidatePath("/dashboard/disponibilidad");
  return {};
}

export async function eliminarExcepcion(id: string): Promise<void> {
  const userId = await usuarioActual();
  await db.availabilityOverride.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard/disponibilidad");
}
