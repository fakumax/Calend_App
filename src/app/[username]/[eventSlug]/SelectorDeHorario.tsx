"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { crearReserva, type BookingFormState } from "@/lib/actions/bookings";
import {
  TIMEZONES_COMUNES,
  etiquetaZona,
  timezonesUnicasPorEtiqueta,
} from "@/lib/timezones";

/** Ventana máxima de reserva hacia adelante, en días. */
export const HORIZONTE_DIAS = 60;
const MES_OFFSET_MAX = 2;
const DIAS_SEMANA = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];

interface Slot {
  start: string;
  end: string;
}

interface Override {
  date: string;
  disponible: boolean;
}

const initialState: BookingFormState = {};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fechaLarga(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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

function obtenerHoyLocal() {
  return isoLocal(new Date());
}

function obtenerHoyServidor() {
  return null;
}

export function SelectorDeHorario({
  eventTypeId,
  username,
  eventSlug,
  hostName,
  hostIniciales,
  titulo,
  descripcion,
  duracionMinutos,
  ubicacion,
  diasConDisponibilidad,
  overrides,
}: {
  eventTypeId: string;
  username: string;
  eventSlug: string;
  hostName: string;
  hostIniciales: string;
  titulo: string;
  descripcion: string | null;
  duracionMinutos: number;
  ubicacion: string;
  diasConDisponibilidad: number[];
  overrides: Override[];
}) {
  // La fecha "hoy" se resuelve en el cliente para evitar desfasajes de
  // hidratación (el servidor puede estar en otra zona horaria).
  const hoyIso = useSyncExternalStore<string | null>(
    suscribirseNoOp,
    obtenerHoyLocal,
    obtenerHoyServidor,
  );

  const [mesOffset, setMesOffset] = useState(0);
  const [fecha, setFecha] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [horaSeleccionada, setHoraSeleccionada] = useState<Slot | null>(null);
  const [slotElegido, setSlotElegido] = useState<Slot | null>(null);

  const tzNavegador = useSyncExternalStore(
    suscribirseNoOp,
    obtenerTimezoneNavegador,
    obtenerTimezoneServidor,
  );
  const [zonaElegida, setZonaElegida] = useState<string | null>(null);
  const zona = zonaElegida ?? tzNavegador;
  const zonas = useMemo(
    () => timezonesUnicasPorEtiqueta([tzNavegador, ...TIMEZONES_COMUNES]),
    [tzNavegador],
  );

  const overridesPorFecha = useMemo(
    () => new Map(overrides.map((o) => [o.date, o.disponible])),
    [overrides],
  );

  useEffect(() => {
    if (!fecha) return;
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
      setSlots(null);
    });
    void cargarSlots();

    return () => {
      cancelado = true;
    };
  }, [fecha, username, eventSlug]);

  const [state, formAction, pending] = useActionState(crearReserva, initialState);

  const hora = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-AR", {
      timeZone: zona,
      hour: "2-digit",
      minute: "2-digit",
    });

  // --- calendario ---
  const calendario = useMemo(() => {
    if (!hoyIso) return null;
    const [hy, hm, hd] = hoyIso.split("-").map(Number);
    const hoy = new Date(hy, hm - 1, hd);
    const limite = new Date(hy, hm - 1, hd + HORIZONTE_DIAS);
    const primero = new Date(hy, hm - 1 + mesOffset, 1);
    const inicio = (primero.getDay() + 6) % 7; // semana que arranca lunes
    const diasDelMes = new Date(primero.getFullYear(), primero.getMonth() + 1, 0).getDate();
    const total = Math.ceil((inicio + diasDelMes) / 7) * 7;

    const dias = [];
    for (let i = 0; i < total; i++) {
      const d = new Date(primero.getFullYear(), primero.getMonth(), 1 - inicio + i);
      const enMes = d.getMonth() === primero.getMonth();
      const iso = isoLocal(d);
      const override = overridesPorFecha.get(iso);
      const disponible =
        enMes &&
        d >= hoy &&
        d < limite &&
        (override ?? diasConDisponibilidad.includes(d.getDay()));
      dias.push({
        iso,
        label: enMes ? String(d.getDate()) : "",
        disponible,
        esHoy: enMes && iso === hoyIso,
      });
    }
    return {
      dias,
      mesLabel: primero.toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
    };
  }, [hoyIso, mesOffset, overridesPorFecha, diasConDisponibilidad]);

  const panelIzquierdo = (
    <div className="min-w-[250px] flex-[1_1_250px] rounded-[20px] border border-tinta/[.08] bg-white p-[26px]">
      <Link
        href={`/${username}`}
        className="inline-block rounded-[10px] bg-tinta/5 px-3 py-2 text-[13px] font-semibold text-tinta/65 hover:bg-tinta/10"
      >
        ← Volver
      </Link>
      <div className="mt-5 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-full bg-acento font-display text-[13px] font-bold text-lima">
          {hostIniciales}
        </div>
        <div className="text-sm font-semibold text-tinta/60">{hostName}</div>
      </div>
      <h2 className="mt-3 font-display text-[26px] font-extrabold tracking-[-0.01em]">
        {titulo}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="rounded-lg bg-acento/[.08] px-2.5 py-[5px] text-xs font-bold text-acento">
          {duracionMinutos} min
        </div>
        <div className="rounded-lg bg-tinta/5 px-2.5 py-[5px] text-xs font-semibold text-tinta/60">
          {ubicacion}
        </div>
      </div>
      {descripcion && (
        <p className="mt-3.5 text-sm leading-normal text-tinta/60">{descripcion}</p>
      )}
      <div className="mt-[22px]">
        <div className="text-xs font-bold uppercase tracking-[.06em] text-tinta/45">
          Tu zona horaria
        </div>
        <select
          value={zona}
          onChange={(e) => setZonaElegida(e.target.value)}
          className="mt-2 w-full cursor-pointer rounded-[10px] border-[1.5px] border-tinta/[.12] bg-white px-3 py-2.5 text-sm font-semibold text-tinta"
        >
          {zonas.map((z) => (
            <option key={z} value={z}>
              {etiquetaZona(z)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // --- paso: datos del invitado ---
  if (slotElegido && fecha) {
    return (
      <div className="min-h-screen px-4 pb-24 pt-10">
        <div className="mx-auto flex max-w-[1080px] animate-[fade-up_.3s_ease] flex-wrap items-stretch gap-4">
          {panelIzquierdo}

          <div className="min-w-[300px] flex-[2.7_1_400px] rounded-[20px] border border-tinta/[.08] bg-white p-[26px]">
            <button
              type="button"
              onClick={() => setSlotElegido(null)}
              className="rounded-[10px] bg-tinta/5 px-3 py-2 text-[13px] font-semibold text-tinta/65 hover:bg-tinta/10"
            >
              ← Cambiar horario
            </button>
            <div className="mt-[22px] flex flex-wrap gap-8">
              <div className="min-w-[200px] flex-[1_1_200px]">
                <div className="text-xs font-bold uppercase tracking-[.06em] text-tinta/45">
                  Tu reserva
                </div>
                <div className="mt-3 flex flex-col gap-2.5 rounded-[14px] bg-crema p-4">
                  <div className="text-base font-bold">{titulo}</div>
                  <div className="text-sm capitalize text-tinta/65">{fechaLarga(fecha)}</div>
                  <div className="text-sm font-bold text-acento">
                    {hora(slotElegido.start)} – {hora(slotElegido.end)}
                  </div>
                  <div className="text-[13px] text-tinta/50">{etiquetaZona(zona)}</div>
                </div>
              </div>

              <form
                action={formAction}
                className="flex min-w-[260px] flex-[1.4_1_260px] flex-col gap-3.5"
              >
                <input type="hidden" name="eventTypeId" value={eventTypeId} />
                <input type="hidden" name="startTime" value={slotElegido.start} />
                <input type="hidden" name="guestTimezone" value={zona} />

                <label className="flex flex-col gap-1.5 text-[13px] font-bold">
                  Nombre *
                  <input
                    name="guestName"
                    required
                    placeholder="Tu nombre"
                    className="rounded-[10px] border-[1.5px] border-tinta/[.12] px-3.5 py-3 text-[15px] font-medium outline-none focus:border-acento focus:shadow-[0_0_0_3px_rgba(14,107,74,.15)]"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-bold">
                  Email *
                  <input
                    type="email"
                    name="guestEmail"
                    required
                    placeholder="tu@email.com"
                    className="rounded-[10px] border-[1.5px] border-tinta/[.12] px-3.5 py-3 text-[15px] font-medium outline-none focus:border-acento focus:shadow-[0_0_0_3px_rgba(14,107,74,.15)]"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-bold">
                  Notas
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Contame brevemente de qué querés hablar"
                    className="resize-y rounded-[10px] border-[1.5px] border-tinta/[.12] px-3.5 py-3 text-[15px] font-medium outline-none focus:border-acento focus:shadow-[0_0_0_3px_rgba(14,107,74,.15)]"
                  />
                </label>

                {state.error && (
                  <p className="text-[13px] font-semibold text-red-700">{state.error}</p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl bg-acento p-3.5 text-base font-bold text-white transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_12px_24px_-12px_rgba(14,107,74,.6)] disabled:opacity-50"
                >
                  {pending ? "Confirmando..." : "Confirmar reserva"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- paso: elegir fecha y horario ---
  return (
    <div className="min-h-screen px-4 pb-24 pt-10">
      <div className="mx-auto flex max-w-[1080px] animate-[fade-up_.3s_ease] flex-wrap items-stretch gap-4">
        {panelIzquierdo}

        <div className="min-w-[300px] flex-[1.7_1_330px] rounded-[20px] border border-tinta/[.08] bg-white p-[26px]">
          {!calendario ? (
            <p className="text-sm text-tinta/50">Cargando calendario...</p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="font-display text-[17px] font-bold capitalize">
                  {calendario.mesLabel}
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMesOffset((m) => Math.max(0, m - 1));
                      setFecha(null);
                      setHoraSeleccionada(null);
                    }}
                    disabled={mesOffset === 0}
                    className="size-[34px] rounded-[10px] bg-tinta/5 text-[15px] hover:bg-tinta/10 disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMesOffset((m) => Math.min(MES_OFFSET_MAX, m + 1));
                      setFecha(null);
                      setHoraSeleccionada(null);
                    }}
                    disabled={mesOffset === MES_OFFSET_MAX}
                    className="size-[34px] rounded-[10px] bg-tinta/5 text-[15px] hover:bg-tinta/10 disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="mt-[18px] grid grid-cols-7 gap-1.5">
                {DIAS_SEMANA.map((w) => (
                  <div
                    key={w}
                    className="pb-1 text-center text-[11px] font-bold uppercase tracking-[.05em] text-tinta/40"
                  >
                    {w}
                  </div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1.5">
                {calendario.dias.map((d, i) => {
                  const seleccionado = d.iso === fecha;
                  return (
                    <button
                      key={`${d.iso}-${i}`}
                      type="button"
                      disabled={!d.disponible}
                      onClick={() => {
                        setFecha(d.iso);
                        setHoraSeleccionada(null);
                      }}
                      className={`aspect-square rounded-xl text-[15px] transition-transform ${
                        seleccionado
                          ? "bg-acento font-bold text-white"
                          : d.disponible
                            ? "bg-acento/[.09] font-bold text-acento hover:scale-105"
                            : "text-tinta/30"
                      } ${d.esHoy ? "shadow-[inset_0_0_0_1.5px_rgba(19,31,25,.3)]" : ""}`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              {!fecha && (
                <div className="mt-4 text-[13px] text-tinta/45">
                  Elegí un día disponible para ver los horarios.
                </div>
              )}
            </>
          )}
        </div>

        {fecha && (
          <div className="min-w-[230px] flex-[1_1_230px] animate-[fade-up_.25s_ease] rounded-[20px] border border-tinta/[.08] bg-white p-[26px]">
            <div className="text-base font-bold capitalize">{fechaLarga(fecha)}</div>
            {cargando && <p className="mt-4 text-sm text-tinta/50">Cargando horarios...</p>}
            {!cargando && slots && (
              <>
                <div className="mt-1 text-[13px] text-tinta/50">
                  {slots.length} horarios · {etiquetaZona(zona)}
                </div>
                {slots.length > 0 ? (
                  <>
                    <div
                      className={`mt-4 grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2 pr-0.5 ${
                        slots.length > 10 ? "max-h-[380px] overflow-x-hidden overflow-y-auto" : ""
                      }`}
                    >
                      {slots.map((slot) => {
                        const seleccionado = horaSeleccionada?.start === slot.start;
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => setHoraSeleccionada(slot)}
                            className={`rounded-[10px] border-[1.5px] border-acento py-[11px] text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento/35 ${
                              seleccionado
                                ? "bg-acento text-white"
                                : "bg-white text-acento hover:bg-acento/[.07]"
                            }`}
                          >
                            {hora(slot.start)}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      disabled={!horaSeleccionada}
                      onClick={() => setSlotElegido(horaSeleccionada)}
                      className="mt-4 w-full rounded-xl bg-acento p-3 text-sm font-bold text-white transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_12px_24px_-12px_rgba(14,107,74,.6)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      Continuar →
                    </button>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-tinta/50">
                    No quedan horarios este día. Probá con otro.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
