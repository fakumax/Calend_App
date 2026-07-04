import Link from "next/link";

const FEATURES = [
  {
    titulo: "Slots reales",
    desc: "Calculados según tu disponibilidad, con buffers entre reuniones.",
  },
  {
    titulo: "Zonas horarias automáticas",
    desc: "Cada invitado ve los horarios en su hora local, sin cuentas mentales.",
  },
  {
    titulo: "Sin doble reserva",
    desc: "Un horario tomado desaparece al instante para el resto.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-[1140px] items-center justify-between px-7 py-4">
        <div className="flex items-center gap-2.5 font-display text-xl font-extrabold">
          <div className="flex size-[26px] items-center justify-center rounded-lg bg-acento">
            <div className="size-2.5 rounded-full bg-lima" />
          </div>
          CalendApp
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-[10px] px-3.5 py-[9px] text-sm font-semibold text-tinta/70 hover:bg-tinta/5"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-[10px] bg-tinta px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-px"
          >
            Empezar gratis
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1140px] flex-1 flex-wrap items-center gap-10 px-7 py-6">
        <div className="min-w-[300px] flex-[1_1_420px]">
          <h1 className="font-display text-[clamp(38px,5vw,60px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            Tu agenda,{" "}
            <span className="rounded-[14px] bg-lima px-3 [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
              sin idas y vueltas
            </span>
          </h1>
          <p className="mt-4 max-w-[480px] text-lg leading-relaxed text-tinta/65">
            Compartí tu link, tus invitados eligen un horario libre y listo.
            Zonas horarias, buffers y anti doble-reserva, resuelto.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="rounded-[14px] bg-acento px-6 py-[15px] text-base font-bold text-white transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(14,107,74,.5)]"
            >
              Ver demo en vivo →
            </Link>
            <Link
              href="/registro"
              className="rounded-[14px] border-[1.5px] border-tinta/15 bg-white px-6 py-[15px] text-base font-semibold hover:border-tinta/35"
            >
              Crear mi link gratis
            </Link>
          </div>
          <div className="mt-3 font-mono text-[13px] text-tinta/45">
            calendapp.io/ana-garcia ← así se ve tu link
          </div>
        </div>

        <div className="relative min-w-[300px] flex-[0_1_400px] pt-3.5">
          <div className="animate-[float_7s_ease-in-out_infinite] rounded-[22px] border border-tinta/[.08] bg-white p-6 shadow-[0_24px_60px_-24px_rgba(14,107,74,.35)]">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-acento font-display text-[15px] font-bold text-lima">
                AG
              </div>
              <div>
                <div className="text-[15px] font-bold">Ana García</div>
                <div className="text-[13px] text-tinta/55">
                  Consultoría 1:1 · 60 min
                </div>
              </div>
            </div>
            <div className="mt-[18px] text-sm font-bold">jueves 9 de julio</div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <div className="rounded-[10px] bg-acento px-3.5 py-[9px] text-[13px] font-bold text-white">
                10:00
              </div>
              <div className="rounded-[10px] border-[1.5px] border-tinta/[.12] px-3.5 py-[9px] text-[13px] font-semibold text-tinta/70">
                11:00
              </div>
              <div className="rounded-[10px] border-[1.5px] border-tinta/[.12] px-3.5 py-[9px] text-[13px] font-semibold text-tinta/70">
                14:30
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-tinta p-[13px] text-center text-sm font-bold text-white">
              Confirmar reserva
            </div>
          </div>
          <div className="absolute -right-1 top-0 -rotate-3 rounded-full bg-tinta px-3 py-2 text-xs font-bold text-lima">
            ✓ sin doble reserva
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1140px] flex-wrap gap-4 px-7 pb-4 pt-2">
        {FEATURES.map((f) => (
          <div
            key={f.titulo}
            className="flex-[1_1_220px] rounded-2xl border border-tinta/[.08] bg-white p-4"
          >
            <div className="size-2.5 rounded-full bg-lima shadow-[0_0_0_4px_rgba(216,242,106,.4)]" />
            <div className="mt-2.5 text-base font-bold">{f.titulo}</div>
            <div className="mt-1 text-sm leading-normal text-tinta/60">
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      <footer className="py-3 text-center text-[13px] text-tinta/40">
        CalendApp © {new Date().getFullYear()} ·{" "}
        <a
          href="http://fakumax.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-tinta/55 hover:text-acento"
        >
          fakumax.dev
        </a>
      </footer>
    </div>
  );
}
