# Agenda de turnos (Calendly-like)

App de agendamiento de reuniones/turnos tipo Calendly: cada usuario define su
disponibilidad y sus tipos de evento, y comparte un link público donde
cualquiera puede reservar un horario libre.

Este repo por ahora contiene la **planificación completa** del proyecto y el
**scaffold inicial**. La implementación de las funcionalidades se va a ir
sumando siguiendo el roadmap.

## Documentación

- [`docs/01-decision-stack.md`](docs/01-decision-stack.md) — por qué Next.js
  y no Astro o Vite.
- [`docs/02-arquitectura.md`](docs/02-arquitectura.md) — estructura de rutas,
  capas de la app, motor de disponibilidad.
- [`docs/03-modelo-datos.md`](docs/03-modelo-datos.md) — schema de Prisma.
- [`docs/04-funcionalidades.md`](docs/04-funcionalidades.md) — spec de features.
- [`docs/05-roadmap.md`](docs/05-roadmap.md) — fases de implementación.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL +
Auth.js, gestionado con **pnpm**.

## Desarrollo

```bash
pnpm install
cp .env.example .env      # completar DATABASE_URL, etc.
pnpm prisma migrate dev
pnpm dev
```

## Scripts

- `pnpm dev` — servidor de desarrollo
- `pnpm build` — build de producción
- `pnpm lint` — lint
- `pnpm test` — tests unitarios (Vitest)
