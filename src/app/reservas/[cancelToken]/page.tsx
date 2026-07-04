import { notFound } from "next/navigation";
import { db } from "@/lib/db";
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

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">
        {cancelada ? "Reserva cancelada" : "Reserva confirmada"}
      </h1>

      <div className="rounded border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        <p className="font-medium">{booking.eventType.title}</p>
        <p className="text-zinc-600 dark:text-zinc-400">
          {booking.startTime.toLocaleString("es-AR", { timeZone: booking.guestTimezone })} (tu hora)
        </p>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Con {booking.eventType.user.name}</p>
        <p className="text-zinc-600 dark:text-zinc-400">{booking.eventType.location}</p>
      </div>

      {!cancelada && <CancelarButton cancelToken={cancelToken} />}
    </div>
  );
}
