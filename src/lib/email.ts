import { Resend } from "resend";
import type { Booking, EventType, User } from "@prisma/client";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM ?? "Agenda <no-reply@localhost>";

async function enviar(destinatario: string, subject: string, text: string) {
  if (!resend) {
    console.log(`[email] (RESEND_API_KEY no configurada, no se envía) para ${destinatario}\n${subject}\n${text}`);
    return;
  }
  await resend.emails.send({ from, to: destinatario, subject, text });
}

type BookingConEvento = Booking & { eventType: EventType & { user: User } };

export async function enviarEmailConfirmacion(booking: Booking, eventType: EventType & { user: User }) {
  const resumen = `${eventType.title} el ${booking.startTime.toLocaleString("es-AR", {
    timeZone: booking.guestTimezone,
  })} (tu hora)`;
  const linkGestion = `${process.env.AUTH_URL ?? ""}/reservas/${booking.cancelToken}`;

  await enviar(
    booking.guestEmail,
    `Confirmado: ${eventType.title}`,
    `Tu turno quedó confirmado.\n\n${resumen}\n\nPara cancelar o reprogramar: ${linkGestion}`,
  );

  await enviar(
    eventType.user.email,
    `Nueva reserva: ${eventType.title}`,
    `${booking.guestName} (${booking.guestEmail}) reservó "${eventType.title}".\n\n${resumen}`,
  );
}

export async function enviarEmailCancelacion(booking: BookingConEvento) {
  const resumen = `${booking.eventType.title} el ${booking.startTime.toLocaleString("es-AR", {
    timeZone: booking.guestTimezone,
  })} (tu hora)`;

  await enviar(booking.guestEmail, `Cancelado: ${booking.eventType.title}`, `Se canceló tu turno.\n\n${resumen}`);
  await enviar(
    booking.eventType.user.email,
    `Cancelación: ${booking.eventType.title}`,
    `${booking.guestName} canceló el turno.\n\n${resumen}`,
  );
}

export async function enviarEmailRecordatorio(booking: BookingConEvento) {
  const resumen = `${booking.eventType.title} el ${booking.startTime.toLocaleString("es-AR", {
    timeZone: booking.guestTimezone,
  })} (tu hora)`;

  await enviar(booking.guestEmail, `Recordatorio: ${booking.eventType.title}`, `Te esperamos pronto.\n\n${resumen}`);
}
