import { crearTipoEvento } from "@/lib/actions/eventTypes";
import { EventTypeForm } from "../EventTypeForm";

export default function NuevoTipoEventoPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Nuevo tipo de evento</h1>
      <EventTypeForm action={crearTipoEvento} submitLabel="Crear" />
    </div>
  );
}
