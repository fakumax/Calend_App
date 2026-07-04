import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SelectorDeHorario } from "./SelectorDeHorario";

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

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">{eventType.title}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {eventType.durationMinutes} min · con {host.name}
        </p>
        {eventType.description && <p className="mt-2 text-sm">{eventType.description}</p>}
      </div>

      <SelectorDeHorario eventTypeId={eventType.id} username={username} eventSlug={eventSlug} />
    </div>
  );
}
