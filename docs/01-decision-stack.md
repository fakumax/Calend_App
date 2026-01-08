# Decisión de stack

## Opciones evaluadas

| Criterio | Astro | Next.js | Vite (SPA) |
|---|---|---|---|
| Backend integrado (API routes / Server Actions) | Limitado (endpoints básicos, sin Server Actions) | Sí, nativo | No, requiere servidor aparte (Express/Fastify) |
| Renderizado dinámico por request (SSR real) | Sí, pero pensado para contenido mayormente estático | Sí, es su caso de uso principal | No aplica (SPA client-side) |
| Auth (login del anfitrión) | Hay que armarlo a mano | Librerías maduras (Auth.js/NextAuth, Clerk, Lucia) | Igual, todo a mano + backend propio |
| ORM / base de datos | Se puede, pero no es el foco | Integración directa con Prisma en route handlers/Server Actions | Necesita un backend propio para hablar con la DB |
| Interactividad (calendario, selección de horarios, dashboard) | "Islands", pensado para poca interactividad | React Server + Client Components, ideal para dashboards | Excelente para SPA pura, pero sin SSR/SEO out of the box |
| SEO de la página pública de reserva (`/[usuario]`) | Muy bueno | Muy bueno (SSR/SSG) | Débil (todo se renderiza en el cliente) |
| Despliegue | Estático/edge, muy simple | Vercel (o cualquier Node host), simple | Requiere backend + frontend por separado |
| Curva para "app tipo SaaS" con muchas pantallas autenticadas | No es su fuerte | Es exactamente su fuerte | Posible pero con más piezas para mantener |

## Decisión: **Next.js (App Router, TypeScript)**

Una app de agendamiento tipo Calendly no es un sitio de contenido: tiene autenticación,
una base de datos con disponibilidad y turnos, lógica de servidor para evitar
doble-booking, manejo de zonas horarias, envío de emails y un dashboard privado
con bastante interactividad. Next.js cubre todo eso con una sola herramienta:

- **Server Actions / Route Handlers** para la lógica de negocio (crear turno,
  calcular horarios libres, cancelar/reprogramar) sin tener que levantar un
  backend aparte.
- **Server Components** para renderizar la página pública de reserva rápido y
  con buen SEO, y **Client Components** solo donde hace falta interactividad
  (el selector de horario, el formulario de reserva).
- Ecosistema maduro para lo que esta app necesita: **Auth.js** (login),
  **Prisma** (ORM), **Resend/Nodemailer** (emails), **Vercel Cron** (recordatorios).
- Despliegue simple en Vercel con Postgres administrado (Neon/Supabase),
  sin infraestructura propia que mantener.

Astro queda mejor para blogs/landing pages mayormente estáticos (como era este
repo con Gatsby+Prismic). Vite+React sería una alternativa válida pero obliga a
mantener un backend separado para todo lo que en Next.js viene integrado
(auth, DB, API), lo cual es trabajo extra sin beneficio real para este caso.

## Resto del stack

- **Gestor de paquetes:** pnpm
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Base de datos:** PostgreSQL (Neon/Supabase en prod, SQLite o Postgres local en dev)
- **ORM:** Prisma
- **Autenticación:** Auth.js (credenciales + magic link por email)
- **Validación:** Zod
- **Emails:** Resend
- **Fechas/zonas horarias:** `date-fns` + `date-fns-tz` (o `Temporal` si ya está estable)
- **Testing:** Vitest (unidades) + Playwright (E2E del flujo de reserva)
- **Deploy:** Vercel
