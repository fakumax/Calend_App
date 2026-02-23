"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelarReserva } from "@/lib/actions/bookings";

export function CancelarReservaHost({ cancelToken }: { cancelToken: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await cancelarReserva(cancelToken);
          router.refresh();
        })
      }
      className="text-sm text-red-600 underline disabled:opacity-50"
    >
      {pending ? "Cancelando..." : "Cancelar"}
    </button>
  );
}
