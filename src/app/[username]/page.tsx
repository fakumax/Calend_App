import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { iniciales } from "@/lib/formato";
import { etiquetaZona } from "@/lib/timezones";

export default async function PerfilPublicoPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const host = await db.user.findUnique({
    where: { username },
    include: { eventTypes: { where: { isActive: true }, orderBy: { createdAt: "asc" } } },
  });

  if (!host) notFound();

  return (
    <div className="min-h-screen px-5 pb-24 pt-16">
      <div className="mx-auto max-w-[560px] animate-[fade-up_.3s_ease]">
        <div className="flex size-[72px] items-center justify-center rounded-full bg-acento font-display text-[26px] font-bold text-lima">
          {iniciales(host.name)}
        </div>
        <h1 className="mt-[18px] font-display text-[34px] font-extrabold tracking-[-0.01em]">
          {host.name}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-tinta/60">
          Elegí un tipo de reunión y busquemos un horario.
        </p>
        <div className="mt-3.5 inline-flex items-center gap-[7px] rounded-full border border-tinta/10 bg-white px-3 py-[7px] text-[13px] font-semibold text-tinta/65">
          <div className="size-[7px] rounded-full bg-acento" />
          {etiquetaZona(host.timezone)}
        </div>

        <div className="mt-7 flex flex-col gap-3">
          {host.eventTypes.map((evento) => (
            <Link
              key={evento.id}
              href={`/${username}/${evento.slug}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-tinta/[.08] bg-white px-[22px] py-5 text-left transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-acento/30 hover:shadow-[0_14px_30px_-18px_rgba(14,107,74,.45)]"
            >
              <div>
                <div className="text-[17px] font-bold text-tinta">{evento.title}</div>
                {evento.description && (
                  <div className="mt-1 text-sm leading-normal text-tinta/55">
                    {evento.description}
                  </div>
                )}
                <div className="mt-2.5 inline-block rounded-lg bg-acento/[.08] px-2.5 py-[5px] text-xs font-bold text-acento">
                  {evento.durationMinutes} min
                </div>
              </div>
              <div className="text-xl text-acento">→</div>
            </Link>
          ))}
          {host.eventTypes.length === 0 && (
            <p className="text-sm text-tinta/60">
              Este usuario todavía no tiene tipos de evento disponibles.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
