import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { etiquetaZona } from "@/lib/timezones";
import { CancelarButton } from "./CancelarButton";

export default async function GestionarReservaPage({
  params,
}: {
  params: Promise<{ cancelToken: string }>;
}) {
  const { cancelToken } = await params;

  const booking = await db.booking.findUnique({
    where: { cancelToken },
    include: { eventType: { include: { user: true } } },
  });
  if (!booking) notFound();

  const cancelada = booking.status === "CANCELLED";
  const tz = booking.guestTimezone;
  const fecha = booking.startTime.toLocaleDateString("es-AR", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const hora = (d: Date) =>
    d.toLocaleTimeString("es-AR", { timeZone: tz, hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex min-h-screen items-center justify-center px-5 pb-24 pt-10">
      <div className="w-full max-w-[460px] animate-[fade-up_.3s_ease] rounded-3xl border border-tinta/[.08] bg-white p-10 text-center">
        <div
          className={`mx-auto flex size-16 animate-[pop_.45s_ease] items-center justify-center rounded-full font-display text-[28px] font-extrabold ${
            cancelada ? "bg-tinta/10 text-tinta/50" : "bg-lima text-tinta"
          }`}
        >
          {cancelada ? "✕" : "✓"}
        </div>
        <h2 className="mb-2 mt-5 font-display text-[28px] font-extrabold tracking-[-0.01em]">
          {cancelada ? "Reserva cancelada" : "¡Reserva confirmada!"}
        </h2>
        <p className="text-[15px] text-tinta/60">
          {cancelada ? (
            <>Esta reserva fue cancelada.</>
          ) : (
            <>
              Te enviamos los detalles a <b>{booking.guestEmail}</b>
            </>
          )}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 rounded-[14px] bg-crema p-[18px] text-left">
          <div className="flex justify-between gap-3">
            <span className="text-[13px] text-tinta/50">Reunión</span>
            <span className="text-right text-sm font-bold">
              {booking.eventType.title} · {booking.eventType.durationMinutes} min
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[13px] text-tinta/50">Con</span>
            <span className="text-right text-sm font-bold">{booking.eventType.user.name}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[13px] text-tinta/50">Fecha</span>
            <span className="text-right text-sm font-bold capitalize">{fecha}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[13px] text-tinta/50">Hora</span>
            <span className="text-right text-sm font-bold text-acento">
              {hora(booking.startTime)} – {hora(booking.endTime)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[13px] text-tinta/50">Zona</span>
            <span className="text-right text-[13px] font-semibold text-tinta/70">
              {etiquetaZona(tz)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[13px] text-tinta/50">Lugar</span>
            <span className="text-right text-[13px] font-semibold text-tinta/70">
              {booking.eventType.location}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            href={`/${booking.eventType.user.username}/${booking.eventType.slug}`}
            className="rounded-xl border-[1.5px] border-tinta/15 bg-white px-[18px] py-[11px] text-sm font-semibold hover:border-tinta/40"
          >
            Hacer otra reserva
          </Link>
          <Link
            href="/"
            className="rounded-xl px-3.5 py-[11px] text-sm font-semibold text-tinta/55 hover:bg-tinta/5"
          >
            Ir al inicio
          </Link>
        </div>

        {!cancelada && (
          <div className="mt-5 border-t border-tinta/[.08] pt-5">
            <CancelarButton cancelToken={cancelToken} />
          </div>
        )}
      </div>
    </div>
  );
}
