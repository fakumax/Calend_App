import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { actualizarTipoEvento } from "@/lib/actions/eventTypes";
import { EventTypeForm } from "../EventTypeForm";

export default async function EditarTipoEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const evento = await db.eventType.findFirst({ where: { id, userId } });
  if (!evento) notFound();

  const actualizarConId = actualizarTipoEvento.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Editar tipo de evento</h1>
      <EventTypeForm
        action={actualizarConId}
        submitLabel="Guardar cambios"
        defaultValues={{
          title: evento.title,
          description: evento.description,
          durationMinutes: evento.durationMinutes,
          location: evento.location,
          color: evento.color,
          bufferBeforeMin: evento.bufferBeforeMin,
          bufferAfterMin: evento.bufferAfterMin,
          minNoticeMinutes: evento.minNoticeMinutes,
          maxPerDay: evento.maxPerDay,
        }}
      />
    </div>
  );
}
