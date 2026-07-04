import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [proximosTurnos, cantidadTiposEvento] = await Promise.all([
    db.booking.findMany({
      where: { hostId: userId, status: "CONFIRMED", startTime: { gte: new Date() } },
      orderBy: { startTime: "asc" },
      take: 5,
      include: { eventType: true },
    }),
    db.eventType.count({ where: { userId } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Resumen</h1>

      {cantidadTiposEvento === 0 && (
        <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950">
          Todavía no creaste ningún tipo de evento.{" "}
          <Link href="/dashboard/tipos-de-evento/nuevo" className="underline">
            Crear el primero
          </Link>
          .
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-medium">Próximos turnos</h2>
        {proximosTurnos.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No tenés turnos confirmados próximamente.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {proximosTurnos.map((turno) => (
              <li
                key={turno.id}
                className="flex items-center justify-between rounded border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">{turno.eventType.title}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {turno.guestName} · {turno.startTime.toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
