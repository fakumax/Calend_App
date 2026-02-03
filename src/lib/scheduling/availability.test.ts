import { describe, expect, it } from "vitest";
import { calcularSlotsDisponibles, haySolapamiento } from "./availability";

const TZ = "America/Argentina/Buenos_Aires";

describe("haySolapamiento", () => {
  it("detecta solapamiento simple", () => {
    const a = { start: new Date("2026-01-20T10:00:00Z"), end: new Date("2026-01-20T11:00:00Z") };
    const b = { start: new Date("2026-01-20T10:30:00Z"), end: new Date("2026-01-20T11:30:00Z") };
    expect(haySolapamiento(a, b)).toBe(true);
  });

  it("no detecta solapamiento cuando no se tocan", () => {
    const a = { start: new Date("2026-01-20T10:00:00Z"), end: new Date("2026-01-20T11:00:00Z") };
    const b = { start: new Date("2026-01-20T11:00:00Z"), end: new Date("2026-01-20T12:00:00Z") };
    expect(haySolapamiento(a, b)).toBe(false);
  });
});

describe("calcularSlotsDisponibles", () => {
  const eventType = {
    durationMinutes: 30,
    bufferBeforeMin: 0,
    bufferAfterMin: 0,
    minNoticeMinutes: 0,
  };

  it("genera slots de 30 minutos dentro del horario semanal", () => {
    const slots = calcularSlotsDisponibles({
      weeklyRules: [{ dayOfWeek: 2, startTime: "09:00", endTime: "10:00" }], // martes
      overrides: [],
      busy: [],
      eventType,
      rangeStart: new Date("2026-01-19T00:00:00Z"),
      rangeEnd: new Date("2026-01-21T00:00:00Z"),
      hostTimezone: TZ,
      now: new Date("2026-01-01T00:00:00Z"),
    });

    expect(slots).toHaveLength(2);
  });

  it("respeta una reserva existente (busy)", () => {
    const slots = calcularSlotsDisponibles({
      weeklyRules: [{ dayOfWeek: 2, startTime: "09:00", endTime: "10:00" }],
      overrides: [],
      busy: [
        {
          start: new Date("2026-01-20T12:00:00Z"),
          end: new Date("2026-01-20T12:30:00Z"),
        },
      ],
      eventType,
      rangeStart: new Date("2026-01-19T00:00:00Z"),
      rangeEnd: new Date("2026-01-21T00:00:00Z"),
      hostTimezone: TZ,
      now: new Date("2026-01-01T00:00:00Z"),
    });

    expect(slots).toHaveLength(1);
  });

  it("un override de día no disponible anula la regla semanal", () => {
    const slots = calcularSlotsDisponibles({
      weeklyRules: [{ dayOfWeek: 2, startTime: "09:00", endTime: "10:00" }],
      overrides: [{ date: "2026-01-20", isAvailable: false }],
      busy: [],
      eventType,
      rangeStart: new Date("2026-01-19T00:00:00Z"),
      rangeEnd: new Date("2026-01-21T00:00:00Z"),
      hostTimezone: TZ,
      now: new Date("2026-01-01T00:00:00Z"),
    });

    expect(slots).toHaveLength(0);
  });
});
