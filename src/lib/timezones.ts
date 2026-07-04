export const TIMEZONES_COMUNES = [
  "America/Argentina/Buenos_Aires",
  "America/Santiago",
  "America/Montevideo",
  "America/Sao_Paulo",
  "America/Bogota",
  "America/Mexico_City",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/Madrid",
  "Europe/London",
  "UTC",
];

/** "America/Argentina/Buenos_Aires" → "Buenos Aires (GMT-3)". */
export function etiquetaZona(tz: string): string {
  const ciudad = (tz.split("/").pop() ?? tz).replace(/_/g, " ");
  try {
    const gmt =
      new Intl.DateTimeFormat("es-AR", { timeZone: tz, timeZoneName: "shortOffset" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? "";
    return gmt ? `${ciudad} (${gmt})` : ciudad;
  } catch {
    return ciudad;
  }
}

/**
 * Quita duplicados por etiqueta visible (ej: dos IDs que muestran
 * "Buenos Aires (GMT-3)").
 */
export function timezonesUnicasPorEtiqueta(timezones: string[]): string[] {
  const porEtiqueta = new Map<string, string>();
  for (const tz of timezones) {
    const label = etiquetaZona(tz);
    if (!porEtiqueta.has(label)) porEtiqueta.set(label, tz);
  }
  return Array.from(porEtiqueta.values());
}
