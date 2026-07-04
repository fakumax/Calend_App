import type { Metadata } from "next";
import { DemoReserva } from "./DemoReserva";

export const metadata: Metadata = {
  title: "Demo en vivo",
  description:
    "Probá el flujo de reserva de CalendApp: calendario, horarios y confirmación, con datos de ejemplo.",
};

export default function DemoPage() {
  return <DemoReserva />;
}
