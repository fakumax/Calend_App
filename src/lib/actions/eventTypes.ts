"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const slugify = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const eventTypeSchema = z.object({
  title: z.string().min(2, "El título es muy corto."),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  location: z.string().min(1, "Indicá una ubicación o link."),
  color: z.string().min(1),
  bufferBeforeMin: z.coerce.number().int().min(0).max(120),
  bufferAfterMin: z.coerce.number().int().min(0).max(120),
  minNoticeMinutes: z.coerce.number().int().min(0).max(10080),
  maxPerDay: z.coerce.number().int().min(1).optional().or(z.literal("")),
});

export interface EventTypeFormState {
  error?: string;
}

async function usuarioActual() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado.");
  return session.user.id;
}

export async function crearTipoEvento(
  _prevState: EventTypeFormState,
  formData: FormData,
): Promise<EventTypeFormState> {
  const userId = await usuarioActual();
  const parsed = eventTypeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { maxPerDay, ...data } = parsed.data;

  const baseSlug = slugify(data.title) || "evento";
  let slug = baseSlug;
  let sufijo = 1;
  while (await db.eventType.findUnique({ where: { userId_slug: { userId, slug } } })) {
    slug = `${baseSlug}-${++sufijo}`;
  }

  await db.eventType.create({
    data: { ...data, slug, userId, maxPerDay: maxPerDay === "" ? null : maxPerDay },
  });

  revalidatePath("/dashboard/tipos-de-evento");
  redirect("/dashboard/tipos-de-evento");
}

export async function actualizarTipoEvento(
  id: string,
  _prevState: EventTypeFormState,
  formData: FormData,
): Promise<EventTypeFormState> {
  const userId = await usuarioActual();
  const parsed = eventTypeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { maxPerDay, ...data } = parsed.data;

  await db.eventType.updateMany({
    where: { id, userId },
    data: { ...data, maxPerDay: maxPerDay === "" ? null : maxPerDay },
  });

  revalidatePath("/dashboard/tipos-de-evento");
  redirect("/dashboard/tipos-de-evento");
}

export async function alternarActivo(id: string, isActive: boolean): Promise<void> {
  const userId = await usuarioActual();
  await db.eventType.updateMany({ where: { id, userId }, data: { isActive } });
  revalidatePath("/dashboard/tipos-de-evento");
}

export async function borrarTipoEvento(id: string): Promise<void> {
  const userId = await usuarioActual();
  await db.eventType.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard/tipos-de-evento");
}
