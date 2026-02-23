import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CancelarReservaHost } from "./CancelarReservaHost";

export default async function ReservasPage() {
  const session = await auth();
  const userId = session!.user.id;

  const reservas = await db.booking.findMany({
    where: { hostId: userId },
    orderBy: { startTime: "desc" },
    include: { eventType: true },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Reservas</h1>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2">Tipo de evento</th>
            <th className="py-2">Invitado</th>
            <th className="py-2">Fecha</th>
            <th className="py-2">Estado</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((r) => (
            <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2">{r.eventType.title}</td>
              <td className="py-2">
                {r.guestName} <span className="text-zinc-500">({r.guestEmail})</span>
              </td>
              <td className="py-2">{r.startTime.toLocaleString()}</td>
              <td className="py-2">{r.status === "CONFIRMED" ? "Confirmada" : "Cancelada"}</td>
              <td className="py-2">
                {r.status === "CONFIRMED" && <CancelarReservaHost cancelToken={r.cancelToken} />}
              </td>
            </tr>
          ))}
          {reservas.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-zinc-600 dark:text-zinc-400">
                Todavía no hay reservas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
