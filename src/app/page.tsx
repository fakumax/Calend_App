export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-6 px-8 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Agenda de turnos
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Proyecto en construcción. La planificación completa (stack,
          arquitectura, modelo de datos y roadmap) está en{" "}
          <code className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-zinc-800">
            /docs
          </code>
          .
        </p>
      </main>
    </div>
  );
}
