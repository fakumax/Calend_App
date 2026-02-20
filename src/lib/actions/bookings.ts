"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { calcularSlotsDisponibles } from "@/lib/scheduling/availability";
import { enviarEmailCancelacion, enviarEmailConfirmacion } from "@/lib/email";

const reservaSchema = z.object({
  eventTypeId: z.string().min(1),
  startTime: z.string().min(1),
  guestTimezone: z.string().min(1),
  guestName: z.string().min(2, "Ingresá tu nombre."),
  guestEmail: z.email("Email inválido."),
  notes: z.string().optional(),
});

export interface BookingFormState {
  error?: string;
}

export async function crearReserva(
  _prevState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const parsed = reservaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { eventTypeId, startTime, guestTimezone, guestName, guestEmail, notes } = parsed.data;

  const eventType = await db.eventType.findUnique({
    where: { id: eventTypeId },
    include: { user: true },
  });
  if (!eventType || !eventType.isActive) {
    return { error: "Este tipo de evento ya no está disponible." };
  }

  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) {
    return { error: "Horario inválido." };
  }
  const end = new Date(start.getTime() + eventType.durationMinutes * 60_000);

  let cancelToken: string;
  try {
    const booking = await db.$transaction(async (tx) => {
      const solapa = await tx.booking.findFirst({
        where: {
          hostId: eventType.userId,
          status: "CONFIRMED",
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });
      if (solapa) throw new Error("SLOT_OCUPADO");

      const [reglas, overrides] = await Promise.all([
        tx.availability.findMany({ where: { userId: eventType.userId } }),
        tx.availabilityOverride.findMany({ where: { userId: eventType.userId } }),
      ]);

      const slotsDelDia = calcularSlotsDisponibles({
        weeklyRules: reglas.map((r) => ({ dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime })),
        overrides: overrides.map((o) => ({
          date: o.date.toISOString().slice(0, 10),
          isAvailable: o.isAvailable,
          startTime: o.startTime ?? undefined,
          endTime: o.endTime ?? undefined,
        })),
        busy: [],
        eventType: {
          durationMinutes: eventType.durationMinutes,
          bufferBeforeMin: eventType.bufferBeforeMin,
          bufferAfterMin: eventType.bufferAfterMin,
          minNoticeMinutes: eventType.minNoticeMinutes,
        },
        rangeStart: new Date(start.getTime() - 24 * 60 * 60 * 1000),
        rangeEnd: new Date(end.getTime() + 24 * 60 * 60 * 1000),
        hostTimezone: eventType.user.timezone,
      });

      const esValido = slotsDelDia.some((s) => s.start.getTime() === start.getTime());
      if (!esValido) throw new Error("SLOT_INVALIDO");

      return tx.booking.create({
        data: {
          eventTypeId,
          hostId: eventType.userId,
          guestName,
          guestEmail,
          guestTimezone,
          startTime: start,
          endTime: end,
          notes,
        },
      });
    });

    await enviarEmailConfirmacion(booking, eventType);
    cancelToken = booking.cancelToken;
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_OCUPADO") {
      return { error: "Ese horario ya fue reservado. Elegí otro." };
    }
    if (error instanceof Error && error.message === "SLOT_INVALIDO") {
      return { error: "Ese horario ya no está disponible." };
    }
    throw error;
  }

  redirect(`/reservas/${cancelToken}`);
}

export async function cancelarReserva(cancelToken: string): Promise<{ error?: string }> {
  const booking = await db.booking.findUnique({
    where: { cancelToken },
    include: { eventType: { include: { user: true } } },
  });
  if (!booking) return { error: "Reserva no encontrada." };
  if (booking.status === "CANCELLED") return {};

  const actualizado = await db.booking.update({
    where: { cancelToken },
    data: { status: "CANCELLED" },
    include: { eventType: { include: { user: true } } },
  });

  await enviarEmailCancelacion(actualizado);
  return {};
}
