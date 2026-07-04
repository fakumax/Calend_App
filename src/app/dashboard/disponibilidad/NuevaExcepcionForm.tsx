"use client";

import { useActionState, useState } from "react";
import { agregarExcepcion, type AvailabilityFormState } from "@/lib/actions/availability";

const initialState: AvailabilityFormState = {};

export function NuevaExcepcionForm() {
  const [state, formAction, pending] = useActionState(agregarExcepcion, initialState);
  const [disponible, setDisponible] = useState(false);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded border border-zinc-200 p-4 text-sm dark:border-zinc-800">
      <label className="flex flex-col gap-1">
        Fecha
        <input type="date" name="date" required className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900" />
      </label>
      <label className="flex items-center gap-2 pb-1.5">
        <input
          type="checkbox"
          name="isAvailable"
          checked={disponible}
          onChange={(e) => setDisponible(e.target.checked)}
        />
        Disponible con horario especial (si no, el día queda bloqueado)
      </label>
      {disponible && (
        <>
          <label className="flex flex-col gap-1">
            Desde
            <input type="time" name="startTime" defaultValue="09:00" className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900" />
          </label>
          <label className="flex flex-col gap-1">
            Hasta
            <input type="time" name="endTime" defaultValue="18:00" className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900" />
          </label>
        </>
      )}
      <button type="submit" disabled={pending} className="rounded bg-zinc-900 px-3 py-1.5 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900">
        {pending ? "Guardando..." : "Guardar excepción"}
      </button>
      {state.error && <p className="w-full text-red-600">{state.error}</p>}
    </form>
  );
}
