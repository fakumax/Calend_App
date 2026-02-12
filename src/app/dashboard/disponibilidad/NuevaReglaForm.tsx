"use client";

import { useActionState } from "react";
import { agregarRegla, type AvailabilityFormState } from "@/lib/actions/availability";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const initialState: AvailabilityFormState = {};

export function NuevaReglaForm() {
  const [state, formAction, pending] = useActionState(agregarRegla, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded border border-zinc-200 p-4 text-sm dark:border-zinc-800">
      <label className="flex flex-col gap-1">
        Día
        <select name="dayOfWeek" className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
          {DIAS.map((dia, i) => (
            <option key={dia} value={i}>
              {dia}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Desde
        <input type="time" name="startTime" required defaultValue="09:00" className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900" />
      </label>
      <label className="flex flex-col gap-1">
        Hasta
        <input type="time" name="endTime" required defaultValue="18:00" className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900" />
      </label>
      <button type="submit" disabled={pending} className="rounded bg-zinc-900 px-3 py-1.5 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900">
        {pending ? "Agregando..." : "Agregar"}
      </button>
      {state.error && <p className="w-full text-red-600">{state.error}</p>}
    </form>
  );
}
