import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f3f5f0",
};

const descripcion =
  "Compartí tu link, tus invitados eligen un horario libre y listo. Zonas horarias, buffers y anti doble-reserva, resuelto.";

export const metadata: Metadata = {
  title: {
    default: "CalendApp — Tu agenda, sin idas y vueltas",
    template: "%s · CalendApp",
  },
  description: descripcion,
  applicationName: "CalendApp",
  keywords: [
    "agenda",
    "turnos",
    "reservas",
    "calendario",
    "scheduling",
    "reuniones",
    "disponibilidad",
  ],
  authors: [{ name: "Facundo Vergara", url: "http://fakumax.dev/" }],
  creator: "Facundo Vergara",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "CalendApp",
    title: "CalendApp — Tu agenda, sin idas y vueltas",
    description: descripcion,
  },
  twitter: {
    card: "summary",
    title: "CalendApp — Tu agenda, sin idas y vueltas",
    description: descripcion,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${instrument.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: extensiones del navegador (p. ej. ColorZilla)
          inyectan atributos en <body> antes de que React hidrate. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
