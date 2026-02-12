import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eliminarExcepcion, eliminarRegla } from "@/lib/actions/availability";
import { NuevaReglaForm } from "./NuevaReglaForm";
import { NuevaExcepcionForm } from "./NuevaExcepcionForm";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function DisponibilidadPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [reglas, excepciones] = await Promise.all([
    db.availability.findMany({ where: { userId }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] }),
    db.availabilityOverride.findMany({ where: { userId }, orderBy: { date: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold">Disponibilidad</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Horario semanal</h2>
        <NuevaReglaForm />
        <ul className="flex flex-col gap-2">
          {reglas.map((regla) => (
            <li
              key={regla.id}
              className="flex items-center justify-between rounded border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-800"
            >
              <span>
                {DIAS[regla.dayOfWeek]}: {regla.startTime} – {regla.endTime}
              </span>
              <form action={eliminarRegla.bind(null, regla.id)}>
                <button type="submit" className="text-red-600 underline">
                  Eliminar
                </button>
              </form>
            </li>
          ))}
          {reglas.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Todavía no cargaste ningún horario.</p>
          )}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Excepciones por fecha</h2>
        <NuevaExcepcionForm />
        <ul className="flex flex-col gap-2">
          {excepciones.map((ex) => (
            <li
              key={ex.id}
              className="flex items-center justify-between rounded border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-800"
            >
              <span>
                {ex.date.toISOString().slice(0, 10)}:{" "}
                {ex.isAvailable ? `${ex.startTime} – ${ex.endTime}` : "Bloqueado"}
              </span>
              <form action={eliminarExcepcion.bind(null, ex.id)}>
                <button type="submit" className="text-red-600 underline">
                  Eliminar
                </button>
              </form>
            </li>
          ))}
          {excepciones.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No hay excepciones cargadas.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
