"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelarReserva } from "@/lib/actions/bookings";

export function CancelarButton({ cancelToken }: { cancelToken: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await cancelarReserva(cancelToken);
            if (result.error) setError(result.error);
            else router.refresh();
          })
        }
        className="w-fit rounded border border-red-300 px-4 py-2 text-sm text-red-600 disabled:opacity-50 dark:border-red-800"
      >
        {pending ? "Cancelando..." : "Cancelar reserva"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
