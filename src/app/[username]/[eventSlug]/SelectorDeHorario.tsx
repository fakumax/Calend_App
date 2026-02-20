"use client";

import { startTransition, useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { crearReserva, type BookingFormState } from "@/lib/actions/bookings";

interface Slot {
  start: string;
  end: string;
}

const initialState: BookingFormState = {};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function suscribirseNoOp() {
  return () => {};
}

function obtenerTimezoneNavegador() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function obtenerTimezoneServidor() {
  return "UTC";
}

export function SelectorDeHorario({
  eventTypeId,
  username,
  eventSlug,
}: {
  eventTypeId: string;
  username: string;
  eventSlug: string;
}) {
  const [fecha, setFecha] = useState(hoyISO());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [slotElegido, setSlotElegido] = useState<Slot | null>(null);
  const guestTimezone = useSyncExternalStore(
    suscribirseNoOp,
    obtenerTimezoneNavegador,
    obtenerTimezoneServidor,
  );

  useEffect(() => {
    let cancelado = false;

    async function cargarSlots() {
      const respuesta = await fetch(
        `/api/availability/${encodeURIComponent(username)}/${encodeURIComponent(eventSlug)}?date=${fecha}`,
      );
      const data = await respuesta.json();
      if (cancelado) return;
      setSlots(data.slots ?? []);
      setCargando(false);
    }

    startTransition(() => {
      setCargando(true);
      setSlotElegido(null);
    });
    void cargarSlots();

    return () => {
      cancelado = true;
    };
  }, [fecha, username, eventSlug]);

  const [state, formAction, pending] = useActionState(crearReserva, initialState);

  if (slotElegido) {
    return (
      <form action={formAction} className="flex max-w-sm flex-col gap-4 text-sm">
        <input type="hidden" name="eventTypeId" value={eventTypeId} />
        <input type="hidden" name="startTime" value={slotElegido.start} />
        <input type="hidden" name="guestTimezone" value={guestTimezone} />

        <p className="font-medium">
          {new Date(slotElegido.start).toLocaleString("es-AR", { timeZone: guestTimezone })}
        </p>

        <label className="flex flex-col gap-1">
          Nombre
          <input name="guestName" required className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>
        <label className="flex flex-col gap-1">
          Email
          <input type="email" name="guestEmail" required className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>
        <label className="flex flex-col gap-1">
          Notas (opcional)
          <textarea name="notes" className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>

        {state.error && <p className="text-red-600">{state.error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {pending ? "Confirmando..." : "Confirmar reserva"}
          </button>
          <button type="button" onClick={() => setSlotElegido(null)} className="underline">
            Elegir otro horario
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Fecha
        <input
          type="date"
          value={fecha}
          min={hoyISO()}
          onChange={(e) => setFecha(e.target.value)}
          className="w-fit rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <p className="text-xs text-zinc-500">Horarios en tu zona horaria: {guestTimezone}</p>

      {cargando && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando horarios...</p>}

      {!cargando && slots && slots.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No hay horarios disponibles ese día.</p>
      )}

      {!cargando && slots && slots.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.start}
              onClick={() => setSlotElegido(slot)}
              className="rounded border border-zinc-300 px-3 py-2 text-sm hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500"
            >
              {new Date(slot.start).toLocaleTimeString("es-AR", {
                timeZone: guestTimezone,
                hour: "2-digit",
                minute: "2-digit",
              })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
