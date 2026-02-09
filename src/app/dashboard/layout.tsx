import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard">Resumen</Link>
          <Link href="/dashboard/disponibilidad">Disponibilidad</Link>
          <Link href="/dashboard/tipos-de-evento">Tipos de evento</Link>
          <Link href="/dashboard/reservas">Reservas</Link>
        </nav>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          {session?.user?.username && (
            <Link href={`/${session.user.username}`} target="_blank" className="underline">
              Ver mi página pública
            </Link>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
