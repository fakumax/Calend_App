import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function PerfilPublicoPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const host = await db.user.findUnique({
    where: { username },
    include: { eventTypes: { where: { isActive: true }, orderBy: { createdAt: "asc" } } },
  });

  if (!host) notFound();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">{host.name}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Elegí un tipo de reunión para ver los horarios disponibles.</p>
      </div>

      <ul className="flex flex-col gap-3">
        {host.eventTypes.map((evento) => (
          <li key={evento.id}>
            <Link
              href={`/${username}/${evento.slug}`}
              className="flex items-center justify-between rounded border border-zinc-200 px-4 py-4 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <div>
                <p className="font-medium">{evento.title}</p>
                {evento.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{evento.description}</p>
                )}
              </div>
              <span className="text-sm text-zinc-500">{evento.durationMinutes} min</span>
            </Link>
          </li>
        ))}
        {host.eventTypes.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Este usuario todavía no tiene tipos de evento disponibles.
          </p>
        )}
      </ul>
    </div>
  );
}
