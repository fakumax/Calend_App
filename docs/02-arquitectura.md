# Arquitectura

## Vista general

```
                         ┌─────────────────────────┐
                         │        Next.js app        │
                         │   (App Router, TS, RSC)    │
                         └─────────────┬─────────────┘
                                        │
      ┌──────────────────┬─────────────┼─────────────┬──────────────────┐
      │                  │             │             │                  │
┌─────▼─────┐     ┌───────▼──────┐ ┌────▼───┐  ┌───────▼───────┐  ┌───────▼───────┐
│  Páginas   │     │  Dashboard   │ │  API /  │  │  Auth.js       │  │  Cron jobs     │
│  públicas  │     │  privado     │ │ Server  │  │  (login host)  │  │  (recordatorios│
│ /[usuario] │     │ /app/*       │ │ Actions │  │                │  │  por email)    │
└─────┬──────┘     └───────┬──────┘ └────┬────┘  └───────┬───────┘  └───────┬───────┘
      │                    │             │               │                  │
      └────────────────────┴─────────────┴───────┬───────┴──────────────────┘
                                                   │
                                            ┌──────▼──────┐
                                            │   Prisma     │
                                            │   ORM        │
                                            └──────┬──────┘
                                                   │
                                            ┌──────▼──────┐
                                            │  PostgreSQL  │
                                            └─────────────┘

                        ┌───────────────────────────┐
                        │  Servicio de email (Resend) │  ← confirmaciones, recordatorios, cancelaciones
                        └───────────────────────────┘
```

## Rutas principales (App Router)

```
app/
  (public)/
    [username]/
      page.tsx            # perfil público del anfitrión: lista de tipos de evento
      [eventSlug]/
        page.tsx           # calendario + selección de horario para ese tipo de evento
        confirmar/page.tsx  # formulario de datos del invitado + confirmación
    reservas/[bookingToken]/
      page.tsx             # ver / cancelar / reprogramar una reserva (link enviado por email)

  (auth)/
    login/page.tsx
    registro/page.tsx

  (dashboard)/                # requiere sesión
    layout.tsx
    page.tsx                  # resumen: próximos turnos
    disponibilidad/page.tsx    # horarios semanales + excepciones
    tipos-de-evento/
      page.tsx
      [id]/page.tsx
    reservas/page.tsx          # listado de reservas del anfitrión

  api/
    bookings/route.ts
    bookings/[id]/cancel/route.ts
    bookings/[id]/reschedule/route.ts
    availability/[username]/[eventSlug]/route.ts   # calcula slots libres
    auth/[...nextauth]/route.ts
    cron/reminders/route.ts
```

## Capas

- **UI (Server Components):** páginas públicas y del dashboard, obtienen datos
  directo de Prisma en el servidor. Sin lógica de negocio acá.
- **UI (Client Components):** solo donde hace falta estado/interacción:
  selector de fecha/hora, formulario de reserva, selector de zona horaria,
  editor de disponibilidad semanal.
- **Server Actions / Route Handlers:** toda la lógica de negocio (crear
  reserva, validar solapamientos, generar tokens de cancelación, calcular
  slots disponibles). Es la única capa que puede escribir en la base de datos.
- **Dominio (`lib/scheduling/`):** funciones puras, testeables, sin
  dependencia de Next.js:
  - `calcularSlotsDisponibles(eventType, disponibilidad, reservasExistentes, rango)`
  - `haySolapamiento(a, b)`
  - `convertirZonaHoraria(fecha, tzOrigen, tzDestino)`
- **Prisma:** acceso a datos. Un único `PrismaClient` compartido (`lib/db.ts`).

## Motor de disponibilidad (el corazón de la app)

1. Tomar las reglas semanales del anfitrión (`Availability`) para el rango de
   fechas pedido.
2. Aplicar excepciones puntuales (`AvailabilityOverride`): días libres,
   horarios especiales.
3. Restar las reservas ya confirmadas (`Booking`) + buffers antes/después
   configurados en el `EventType`.
4. Aplicar el aviso mínimo (`minNoticeMinutes`) y el límite de reservas por
   día si corresponde.
5. Trocear el resultado en bloques de la duración del `EventType`.
6. Convertir cada bloque a la zona horaria del invitado antes de mostrarlo.

Esta función vive en `lib/scheduling/` sin tocar la base de datos directamente
(recibe los datos ya cargados) para poder testearla con Vitest sin mockear Prisma.

## Multi-tenant vs. uso personal

El modelo de datos soporta múltiples usuarios/anfitriones desde el día uno
(cada `EventType`, `Availability` y `Booking` cuelga de un `userId`), aunque el
uso inicial sea un solo usuario (vos). Esto evita tener que migrar el modelo
más adelante si se quiere compartir o convertir en un producto para más gente.
