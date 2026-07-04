"use client";

import { useActionState } from "react";
import type { EventTypeFormState } from "@/lib/actions/eventTypes";

const initialState: EventTypeFormState = {};

export function EventTypeForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: EventTypeFormState, formData: FormData) => Promise<EventTypeFormState>;
  defaultValues?: {
    title: string;
    description: string | null;
    durationMinutes: number;
    location: string;
    color: string;
    bufferBeforeMin: number;
    bufferAfterMin: number;
    minNoticeMinutes: number;
    maxPerDay: number | null;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4 text-sm">
      <Campo label="Título" name="title" defaultValue={defaultValues?.title} required />
      <label className="flex flex-col gap-1">
        Descripción
        <textarea
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <div className="flex gap-4">
        <Campo
          label="Duración (min)"
          name="durationMinutes"
          type="number"
          defaultValue={defaultValues?.durationMinutes ?? 30}
          required
        />
        <Campo label="Color" name="color" type="color" defaultValue={defaultValues?.color ?? "#6366F1"} />
      </div>
      <Campo
        label="Ubicación (link de videollamada, teléfono, dirección)"
        name="location"
        defaultValue={defaultValues?.location}
        required
      />
      <div className="flex gap-4">
        <Campo
          label="Buffer antes (min)"
          name="bufferBeforeMin"
          type="number"
          defaultValue={defaultValues?.bufferBeforeMin ?? 0}
        />
        <Campo
          label="Buffer después (min)"
          name="bufferAfterMin"
          type="number"
          defaultValue={defaultValues?.bufferAfterMin ?? 0}
        />
      </div>
      <div className="flex gap-4">
        <Campo
          label="Aviso mínimo (min)"
          name="minNoticeMinutes"
          type="number"
          defaultValue={defaultValues?.minNoticeMinutes ?? 60}
        />
        <Campo
          label="Máximo por día (opcional)"
          name="maxPerDay"
          type="number"
          defaultValue={defaultValues?.maxPerDay ?? ""}
        />
      </div>

      {state.error && <p className="text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

function Campo(props: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  const { label, ...inputProps } = props;
  return (
    <label className="flex flex-1 flex-col gap-1">
      {label}
      <input
        {...inputProps}
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />
    </label>
  );
}
