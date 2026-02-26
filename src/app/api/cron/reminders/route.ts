import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enviarEmailRecordatorio } from "@/lib/email";

/**
 * Pensado para dispararse cada 15-30 min vía Vercel Cron.
 * Manda un recordatorio único por reserva, entre 20 y 25 horas antes del turno.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
  }

  const ahora = new Date();
  const desde = new Date(ahora.getTime() + 20 * 60 * 60 * 1000);
  const hasta = new Date(ahora.getTime() + 25 * 60 * 60 * 1000);

  const turnos = await db.booking.findMany({
    where: {
      status: "CONFIRMED",
      reminderSentAt: null,
      startTime: { gte: desde, lte: hasta },
    },
    include: { eventType: { include: { user: true } } },
  });

  for (const turno of turnos) {
    await enviarEmailRecordatorio(turno);
    await db.booking.update({ where: { id: turno.id }, data: { reminderSentAt: ahora } });
  }

  return NextResponse.json({ recordatoriosEnviados: turnos.length });
}
