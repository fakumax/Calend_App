# Roadmap

Fases pensadas para ir implementando de forma incremental, cada una entregando
algo que se puede correr y probar.

## Fase 0 — Setup del proyecto ✅
- Limpiar el repo (era un starter de Gatsby + Prismic sin relación con esta app).
- Definir stack (`01-decision-stack.md`), arquitectura (`02-arquitectura.md`),
  modelo de datos (`03-modelo-datos.md`) y funcionalidades (`04-funcionalidades.md`).
- Scaffold inicial: Next.js + TypeScript + Tailwind + pnpm, Prisma configurado
  con el schema inicial.

## Fase 1 — Auth + perfil del anfitrión
- Login/registro (Auth.js).
- Elegir `username` y timezone.
- Página pública `/[username]` (aunque todavía sin tipos de evento cargados).

## Fase 2 — Disponibilidad
- CRUD de horario semanal (`Availability`).
- CRUD de excepciones puntuales (`AvailabilityOverride`).
- UI del dashboard para editarlo.

## Fase 3 — Tipos de evento
- CRUD de `EventType`.
- Página pública que lista los tipos de evento activos de un usuario.

## Fase 4 — Motor de disponibilidad + reserva pública
- Implementar `calcularSlotsDisponibles` en `lib/scheduling/` (con tests).
- Página `/[username]/[eventSlug]` con calendario y horarios disponibles.
- Formulario de confirmación y creación de `Booking`.
- Detección de zona horaria del invitado.

## Fase 5 — Emails y gestión de reservas
- Email de confirmación (Resend) al crear una reserva.
- Página `/reservas/[cancelToken]` para cancelar/reprogramar.
- Dashboard: listado de reservas del anfitrión + cancelación manual.

## Fase 6 — Recordatorios
- Cron job (`Vercel Cron` + route handler) que revisa turnos próximos y
  manda recordatorio por email.

## Fase 7 — Pulido
- Manejo de errores y estados vacíos en toda la UI.
- Tests E2E del flujo completo de reserva (Playwright).
- Deploy a Vercel + Postgres administrado (Neon/Supabase).

## Backlog / extensiones futuras
- Sincronización con Google Calendar (evitar doble-booking con eventos externos).
- Agendamiento en equipo (round-robin entre varios anfitriones).
- Pagos (Stripe) para reservas pagas.
- Página de administración multi-usuario si se decide ofrecerlo a más gente.
