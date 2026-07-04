import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { alternarActivo, borrarTipoEvento } from "@/lib/actions/eventTypes";

export default async function TiposDeEventoPage() {
  const session = await auth();
  const userId = session!.user.id;

  const tiposEvento = await db.eventType.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tipos de evento</h1>
        <Link
          href="/dashboard/tipos-de-evento/nuevo"
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-900"
        >
          Nuevo tipo de evento
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {tiposEvento.map((evento) => (
          <li
            key={evento.id}
            className="flex items-center justify-between rounded border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
          >
            <div>
              <p className="font-medium">
                {evento.title} <span className="text-zinc-500">({evento.durationMinutes} min)</span>
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">/{session!.user.username}/{evento.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/tipos-de-evento/${evento.id}`} className="underline">
                Editar
              </Link>
              <form action={alternarActivo.bind(null, evento.id, !evento.isActive)}>
                <button type="submit" className="underline">
                  {evento.isActive ? "Desactivar" : "Activar"}
                </button>
              </form>
              <form action={borrarTipoEvento.bind(null, evento.id)}>
                <button type="submit" className="text-red-600 underline">
                  Borrar
                </button>
              </form>
            </div>
          </li>
        ))}
        {tiposEvento.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Todavía no creaste ningún tipo de evento.</p>
        )}
      </ul>
    </div>
  );
}
