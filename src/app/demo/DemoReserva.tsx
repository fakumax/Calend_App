"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  TIMEZONES_COMUNES,
  etiquetaZona,
  timezonesUnicasPorEtiqueta,
} from "@/lib/timezones";

// Demo interactiva del flujo de reserva: todo corre en el navegador con
// datos ficticios, sin base de datos ni emails. La versión real está en
// /[username]/[eventSlug].

const HORIZONTE_DIAS = 60;
const MES_OFFSET_MAX = 2;
const DIAS_SEMANA = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];

const HOST = { nombre: "Ana García", iniciales: "AG" };
const EVENTO = {
  titulo: "Consultoría 1:1",
  duracionMinutos: 60,
  ubicacion: "Videollamada",
  descripcion:
    "Sesión a fondo para revisar tu proyecto y salir con un plan de acción concreto.",
};

interface Slot {
  start: string;
  end: string;
}

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

/** Hash determinístico para que cada día tenga horarios "ocupados" distintos. */
function hash(s: string) {
  let x = 7;
  for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0;
  return x;
}

/** Slots ficticios: 9 a 17 h de la anfitriona (GMT-3), con ~30% ya tomados. */
function slotsDemo(fecha: string): Slot[] {
  const slots: Slot[] = [];
  for (let h = 9; h + 1 <= 17; h++) {
    if (hash(`${fecha}:${h}`) % 10 < 3) continue;
    const start = new Date(`${fecha}T${pad(h)}:00:00-03:00`);
    const end = new Date(start.getTime() + EVENTO.duracionMinutos * 60_000);
    slots.push({ start: start.toISOString(), end: end.toISOString() });
  }
  return slots;
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

export function DemoReserva() {
  const hoyIso = useSyncExternalStore<string | null>(
    suscribirseNoOp,
    obtenerHoyLocal,
    obtenerHoyServidor,
  );

  const [mesOffset, setMesOffset] = useState(0);
  const [fecha, setFecha] = useState<string | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<Slot | null>(null);
  const [slotElegido, setSlotElegido] = useState<Slot | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

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

  const slots = useMemo(() => (fecha ? slotsDemo(fecha) : null), [fecha]);

  const hora = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-AR", {
      timeZone: zona,
      hour: "2-digit",
      minute: "2-digit",
    });

  const calendario = useMemo(() => {
    if (!hoyIso) return null;
    const [hy, hm, hd] = hoyIso.split("-").map(Number);
    const hoy = new Date(hy, hm - 1, hd);
    const limite = new Date(hy, hm - 1, hd + HORIZONTE_DIAS);
    const primero = new Date(hy, hm - 1 + mesOffset, 1);
    const inicio = (primero.getDay() + 6) % 7;
    const diasDelMes = new Date(primero.getFullYear(), primero.getMonth() + 1, 0).getDate();
    const total = Math.ceil((inicio + diasDelMes) / 7) * 7;

    const dias = [];
    for (let i = 0; i < total; i++) {
      const d = new Date(primero.getFullYear(), primero.getMonth(), 1 - inicio + i);
      const enMes = d.getMonth() === primero.getMonth();
      const iso = isoLocal(d);
      const esDiaHabil = d.getDay() >= 1 && d.getDay() <= 5;
      dias.push({
        iso,
        label: enMes ? String(d.getDate()) : "",
        disponible: enMes && d > hoy && d < limite && esDiaHabil,
        esHoy: enMes && iso === hoyIso,
      });
    }
    return {
      dias,
      mesLabel: primero.toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
    };
  }, [hoyIso, mesOffset]);

  const banner = (
    <div className="mx-auto mb-4 flex max-w-[1080px] flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-tinta px-4 py-2 text-[13px] font-bold text-lima">
        ✨ Demo interactiva — los datos no son reales
      </div>
      <Link
        href="/registro"
        className="rounded-[10px] bg-acento px-4 py-2 text-[13px] font-bold text-white hover:-translate-y-px"
      >
        Crear mi link gratis →
      </Link>
    </div>
  );

  const panelIzquierdo = (
    <div className="min-w-[250px] flex-[1_1_250px] rounded-[20px] border border-tinta/[.08] bg-white p-[26px]">
      <Link
        href="/"
        className="inline-block rounded-[10px] bg-tinta/5 px-3 py-2 text-[13px] font-semibold text-tinta/65 hover:bg-tinta/10"
      >
        ← Volver
      </Link>
      <div className="mt-5 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-full bg-acento font-display text-[13px] font-bold text-lima">
          {HOST.iniciales}
        </div>
        <div className="text-sm font-semibold text-tinta/60">{HOST.nombre}</div>
      </div>
      <h2 className="mt-3 font-display text-[26px] font-extrabold tracking-[-0.01em]">
        {EVENTO.titulo}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="rounded-lg bg-acento/[.08] px-2.5 py-[5px] text-xs font-bold text-acento">
          {EVENTO.duracionMinutos} min
        </div>
        <div className="rounded-lg bg-tinta/5 px-2.5 py-[5px] text-xs font-semibold text-tinta/60">
          {EVENTO.ubicacion}
        </div>
      </div>
      <p className="mt-3.5 text-sm leading-normal text-tinta/60">{EVENTO.descripcion}</p>
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

  // --- confirmación simulada ---
  if (confirmado && slotElegido && fecha) {
    return (
      <div className="flex min-h-screen flex-col px-4 pb-24 pt-8">
        {banner}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[460px] animate-[fade-up_.3s_ease] rounded-3xl border border-tinta/[.08] bg-white p-10 text-center">
            <div className="mx-auto flex size-16 animate-[pop_.45s_ease] items-center justify-center rounded-full bg-lima font-display text-[28px] font-extrabold text-tinta">
              ✓
            </div>
            <h2 className="mb-2 mt-5 font-display text-[28px] font-extrabold tracking-[-0.01em]">
              ¡Reserva confirmada!
            </h2>
            <p className="text-[15px] text-tinta/60">
              En la app real, te llegarían los detalles a <b>{email}</b>
            </p>

            <div className="mt-6 flex flex-col gap-2.5 rounded-[14px] bg-crema p-[18px] text-left">
              <div className="flex justify-between gap-3">
                <span className="text-[13px] text-tinta/50">Reunión</span>
                <span className="text-right text-sm font-bold">
                  {EVENTO.titulo} · {EVENTO.duracionMinutos} min
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[13px] text-tinta/50">Con</span>
                <span className="text-right text-sm font-bold">{HOST.nombre}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[13px] text-tinta/50">Fecha</span>
                <span className="text-right text-sm font-bold capitalize">
                  {fechaLarga(fecha)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[13px] text-tinta/50">Hora</span>
                <span className="text-right text-sm font-bold text-acento">
                  {hora(slotElegido.start)} – {hora(slotElegido.end)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[13px] text-tinta/50">Zona</span>
                <span className="text-right text-[13px] font-semibold text-tinta/70">
                  {etiquetaZona(zona)}
                </span>
              </div>
            </div>

            <p className="mt-4 text-[13px] text-tinta/45">
              Esto es una demo: no se creó ninguna reserva ni se envió ningún email.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setConfirmado(false);
                  setSlotElegido(null);
                  setHoraSeleccionada(null);
                  setFecha(null);
                  setNombre("");
                  setEmail("");
                }}
                className="rounded-xl border-[1.5px] border-tinta/15 bg-white px-[18px] py-[11px] text-sm font-semibold hover:border-tinta/40"
              >
                Probar otra reserva
              </button>
              <Link
                href="/registro"
                className="rounded-xl bg-acento px-[18px] py-[11px] text-sm font-bold text-white hover:-translate-y-px"
              >
                Crear mi link gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- paso: datos del invitado ---
  if (slotElegido && fecha) {
    return (
      <div className="min-h-screen px-4 pb-24 pt-8">
        {banner}
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
                  <div className="text-base font-bold">{EVENTO.titulo}</div>
                  <div className="text-sm capitalize text-tinta/65">{fechaLarga(fecha)}</div>
                  <div className="text-sm font-bold text-acento">
                    {hora(slotElegido.start)} – {hora(slotElegido.end)}
                  </div>
                  <div className="text-[13px] text-tinta/50">{etiquetaZona(zona)}</div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!nombre.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
                    setError(true);
                    return;
                  }
                  setConfirmado(true);
                }}
                className="flex min-w-[260px] flex-[1.4_1_260px] flex-col gap-3.5"
              >
                <label className="flex flex-col gap-1.5 text-[13px] font-bold">
                  Nombre *
                  <input
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      setError(false);
                    }}
                    placeholder="Tu nombre"
                    className="rounded-[10px] border-[1.5px] border-tinta/[.12] px-3.5 py-3 text-[15px] font-medium outline-none focus:border-acento focus:shadow-[0_0_0_3px_rgba(14,107,74,.15)]"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-bold">
                  Email *
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(false);
                    }}
                    placeholder="tu@email.com"
                    className="rounded-[10px] border-[1.5px] border-tinta/[.12] px-3.5 py-3 text-[15px] font-medium outline-none focus:border-acento focus:shadow-[0_0_0_3px_rgba(14,107,74,.15)]"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-bold">
                  Notas
                  <textarea
                    rows={3}
                    placeholder="Contame brevemente de qué querés hablar"
                    className="resize-y rounded-[10px] border-[1.5px] border-tinta/[.12] px-3.5 py-3 text-[15px] font-medium outline-none focus:border-acento focus:shadow-[0_0_0_3px_rgba(14,107,74,.15)]"
                  />
                </label>

                {error && (
                  <p className="text-[13px] font-semibold text-red-700">
                    Completá tu nombre y un email válido.
                  </p>
                )}

                <button
                  type="submit"
                  className="rounded-xl bg-acento p-3.5 text-base font-bold text-white transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_12px_24px_-12px_rgba(14,107,74,.6)]"
                >
                  Confirmar reserva
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
    <div className="min-h-screen px-4 pb-24 pt-8">
      {banner}
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

        {fecha && slots && (
          <div className="min-w-[230px] flex-[1_1_230px] animate-[fade-up_.25s_ease] rounded-[20px] border border-tinta/[.08] bg-white p-[26px]">
            <div className="text-base font-bold capitalize">{fechaLarga(fecha)}</div>
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
          </div>
        )}
      </div>
    </div>
  );
}
