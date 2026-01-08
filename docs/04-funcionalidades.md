# Especificación de funcionalidades

## 1. Autenticación del anfitrión
- Registro con email/contraseña o magic link.
- Login.
- Elegir `username` único (define la URL pública `/[username]`).
- Configurar zona horaria por defecto.

## 2. Disponibilidad
- Definir horario semanal recurrente (por día, uno o más rangos, ej.
  "lunes 9–13 y 15–18").
- Marcar excepciones puntuales: bloquear un día completo o dar un horario
  distinto para una fecha específica.
- Definir aviso mínimo antes de poder reservar (ej. "no antes de 2 horas").
- Definir buffer antes/después de cada turno.

## 3. Tipos de evento (`EventType`)
- CRUD: crear, editar, activar/desactivar, borrar.
- Campos: título, duración, descripción, ubicación (link de videollamada,
  teléfono, presencial), color, buffers, aviso mínimo, tope de reservas/día.
- Cada tipo de evento tiene su propia URL: `/[username]/[eventSlug]`.

## 4. Página pública de reserva
- Lista de tipos de evento activos del anfitrión (`/[username]`).
- Selector de fecha con los días disponibles resaltados.
- Selector de horario (slots calculados en tiempo real, en la timezone
  detectada/elegida por el invitado).
- Formulario de confirmación: nombre, email, notas opcionales.
- Página de confirmación con resumen + botón "agregar al calendario"
  (.ics) + email de confirmación.

## 5. Gestión de reservas (invitado)
- Link único por reserva (`cancelToken`) enviado por email.
- Cancelar reserva desde ese link (sin necesidad de cuenta).
- Reprogramar: cancela la actual y lo manda de nuevo al flujo de selección
  de horario para ese mismo tipo de evento.

## 6. Dashboard del anfitrión
- Próximos turnos (lista, con datos del invitado).
- Buscar/filtrar por tipo de evento o rango de fechas.
- Cancelar un turno desde el dashboard (dispara email al invitado).
- Métricas simples: turnos esta semana, tasa de cancelación.

## 7. Notificaciones por email
- Confirmación al invitado y al anfitrión al crear la reserva.
- Recordatorio configurable (ej. 24 hs y 1 hora antes) vía cron.
- Aviso de cancelación a ambas partes.

## 8. Internacionalización de fechas/horas
- Toda la lógica de disponibilidad se calcula en la timezone del anfitrión
  y se traduce a la del invitado solo para mostrarla.
- Los `Booking.startTime/endTime` se persisten siempre en UTC.

## Fuera de alcance (v1)
- Sincronización con Google/Outlook Calendar (queda documentada como
  extensión futura en `03-modelo-datos.md`).
- Pagos.
- Agendamiento en equipo / round-robin.
- App mobile nativa.
