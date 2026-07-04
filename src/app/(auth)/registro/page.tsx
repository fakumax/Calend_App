"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarUsuario, type AuthFormState } from "@/lib/actions/auth";
import { TIMEZONES_COMUNES } from "@/lib/timezones";

const initialState: AuthFormState = {};

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState(registrarUsuario, initialState);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Crear cuenta</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <Campo label="Nombre" name="name" type="text" required />
        <Campo label="Email" name="email" type="email" required />
        <Campo
          label="Usuario (para tu link público)"
          name="username"
          type="text"
          required
          pattern="[a-z0-9-]+"
          placeholder="facundo"
        />
        <label className="flex flex-col gap-1 text-sm">
          Zona horaria
          <select
            name="timezone"
            required
            defaultValue="America/Argentina/Buenos_Aires"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {TIMEZONES_COMUNES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>
        <Campo label="Contraseña" name="password" type="password" required minLength={8} />

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}

function Campo(props: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  pattern?: string;
  placeholder?: string;
  minLength?: number;
}) {
  const { label, ...inputProps } = props;
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        {...inputProps}
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />
    </label>
  );
}
