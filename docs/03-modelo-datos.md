# Modelo de datos

Prisma schema propuesto (`prisma/schema.prisma`). Se detalla acá con el
razonamiento de cada modelo; el schema real vive en `prisma/schema.prisma`.

```prisma
model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  passwordHash  String?
  username      String   @unique   // slug para /[username]
  timezone      String   @default("America/Argentina/Buenos_Aires")
  avatarUrl     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  eventTypes         EventType[]
  availabilities     Availability[]
  availabilityOverrides AvailabilityOverride[]
  bookings           Booking[]
}

model EventType {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id])
  title            String
  slug             String
  description      String?
  durationMinutes  Int
  location         String   // "google_meet" | "zoom" | "phone" | "in_person" | url libre
  color            String   @default("#6366F1")
  bufferBeforeMin  Int      @default(0)
  bufferAfterMin   Int      @default(0)
  minNoticeMinutes Int      @default(60)
  maxPerDay        Int?
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  bookings Booking[]

  @@unique([userId, slug])
}

model Availability {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  dayOfWeek Int     // 0 = domingo ... 6 = sábado
  startTime String  // "09:00"
  endTime   String  // "18:00"

  @@index([userId, dayOfWeek])
}

model AvailabilityOverride {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  date        DateTime // día puntual
  isAvailable Boolean  // false = día bloqueado (feriado, vacaciones)
  startTime   String?  // si isAvailable=true y horario distinto al habitual
  endTime     String?

  @@unique([userId, date])
}

model Booking {
  id            String   @id @default(cuid())
  eventTypeId   String
  eventType     EventType @relation(fields: [eventTypeId], references: [id])
  hostId        String
  host          User     @relation(fields: [hostId], references: [id])
  guestName     String
  guestEmail    String
  guestTimezone String
  startTime     DateTime
  endTime       DateTime
  status        BookingStatus @default(CONFIRMED)
  notes         String?
  cancelToken   String   @unique @default(cuid())
  reminderSentAt DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([hostId, startTime])
  @@index([eventTypeId, startTime])
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
  RESCHEDULED
}
```

## Notas de diseño

- **`Availability` como reglas semanales recurrentes** en vez de guardar cada
  slot individual: mucho menos volumen de datos y más simple de editar desde
  el dashboard ("lunes a viernes de 9 a 18").
- **`AvailabilityOverride`** cubre el caso "esta fecha puntual es distinta a
  la regla semanal" (feriado, día que se libera antes, vacaciones).
- **`cancelToken`** en `Booking` permite que el invitado cancele/reprograme
  sin necesidad de crear una cuenta, solo con el link que recibe por email.
- **`guestTimezone`** se guarda en el momento de la reserva para poder
  mostrarle siempre sus horarios correctos aunda viaje o cambie de tz después.
- Los horarios de `Availability` se guardan como texto simple (`"09:00"`)
  interpretado en la timezone del `User`, no en UTC, porque son reglas
  recurrentes ("todos los lunes"), no instantes puntuales. `Booking.startTime`
  y `endTime`, en cambio, sí son instantes concretos y se guardan en UTC.

## Migraciones futuras (no día uno)

- `CalendarConnection` (Google Calendar OAuth) para sincronizar turnos
  externos y evitar doble-booking con eventos que no pasan por esta app.
- `Team` / `EventTypeAssignee` para agendamiento round-robin entre varios
  anfitriones.
- `Payment` si en algún momento se cobra por la reserva (Stripe).
