"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelarReserva } from "@/lib/actions/bookings";

export function CancelarButton({ cancelToken }: { cancelToken: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-2">
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
        className="w-fit rounded-xl border-[1.5px] border-red-200 px-[18px] py-[11px] text-sm font-semibold text-red-700 hover:border-red-400 disabled:opacity-50"
      >
        {pending ? "Cancelando..." : "Cancelar reserva"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
