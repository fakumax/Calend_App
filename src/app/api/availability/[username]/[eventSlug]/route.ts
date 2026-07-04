import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calcularSlotsDisponibles } from "@/lib/scheduling/availability";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; eventSlug: string }> },
) {
  const { username, eventSlug } = await params;
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: "Parámetro 'date' inválido (YYYY-MM-DD)." }, { status: 400 });
  }

  const host = await db.user.findUnique({ where: { username } });
  if (!host) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  const eventType = await db.eventType.findUnique({
    where: { userId_slug: { userId: host.id, slug: eventSlug } },
  });
  if (!eventType || !eventType.isActive) {
    return NextResponse.json({ error: "Tipo de evento no encontrado." }, { status: 404 });
  }

  const rangeStart = new Date(`${dateParam}T00:00:00Z`);
  const rangeEnd = new Date(`${dateParam}T23:59:59Z`);
  // Ampliamos un día a cada lado para cubrir bordes de zona horaria.
  const consultaDesde = new Date(rangeStart.getTime() - 24 * 60 * 60 * 1000);
  const consultaHasta = new Date(rangeEnd.getTime() + 24 * 60 * 60 * 1000);

  const [reglas, overrides, reservas] = await Promise.all([
    db.availability.findMany({ where: { userId: host.id } }),
    db.availabilityOverride.findMany({
      where: { userId: host.id, date: { gte: consultaDesde, lte: consultaHasta } },
    }),
    db.booking.findMany({
      where: {
        hostId: host.id,
        status: "CONFIRMED",
        startTime: { lt: consultaHasta },
        endTime: { gt: consultaDesde },
      },
    }),
  ]);

  const slots = calcularSlotsDisponibles({
    weeklyRules: reglas.map((r) => ({ dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime })),
    overrides: overrides.map((o) => ({
      date: o.date.toISOString().slice(0, 10),
      isAvailable: o.isAvailable,
      startTime: o.startTime ?? undefined,
      endTime: o.endTime ?? undefined,
    })),
    busy: reservas.map((r) => ({ start: r.startTime, end: r.endTime })),
    eventType: {
      durationMinutes: eventType.durationMinutes,
      bufferBeforeMin: eventType.bufferBeforeMin,
      bufferAfterMin: eventType.bufferAfterMin,
      minNoticeMinutes: eventType.minNoticeMinutes,
    },
    rangeStart,
    rangeEnd,
    hostTimezone: host.timezone,
  });

  return NextResponse.json({
    slots: slots.map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString() })),
  });
}
