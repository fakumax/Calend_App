import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { iniciales } from "@/lib/formato";
import { SelectorDeHorario, HORIZONTE_DIAS } from "./SelectorDeHorario";

const DIA_MS = 24 * 60 * 60 * 1000;

function rangoHorizonte() {
  const ahora = Date.now();
  return {
    desde: new Date(ahora - DIA_MS),
    hasta: new Date(ahora + (HORIZONTE_DIAS + 1) * DIA_MS),
  };
}

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ username: string; eventSlug: string }>;
}) {
  const { username, eventSlug } = await params;

  const host = await db.user.findUnique({ where: { username } });
  if (!host) notFound();

  const eventType = await db.eventType.findUnique({
    where: { userId_slug: { userId: host.id, slug: eventSlug } },
  });
  if (!eventType || !eventType.isActive) notFound();

  // Para pintar el calendario: días de semana con reglas + excepciones del
  // horizonte de reserva. La validación real del slot sigue en la API/action.
  const { desde, hasta } = rangoHorizonte();
  const reglas = await db.availability.findMany({ where: { userId: host.id } });
  const overrides = await db.availabilityOverride.findMany({
    where: { userId: host.id, date: { gte: desde, lte: hasta } },
  });

  return (
    <SelectorDeHorario
      eventTypeId={eventType.id}
      username={username}
      eventSlug={eventSlug}
      hostName={host.name}
      hostIniciales={iniciales(host.name)}
      titulo={eventType.title}
      descripcion={eventType.description}
      duracionMinutos={eventType.durationMinutes}
      ubicacion={eventType.location}
      diasConDisponibilidad={Array.from(new Set(reglas.map((r) => r.dayOfWeek)))}
      overrides={overrides.map((o) => ({
        date: o.date.toISOString().slice(0, 10),
        // Coincide con el motor: un override habilita el día solo si trae ventana.
        disponible: o.isAvailable && Boolean(o.startTime) && Boolean(o.endTime),
      }))}
    />
  );
}
