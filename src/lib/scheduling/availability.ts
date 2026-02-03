import { addDays, addMinutes, format, isAfter, isBefore, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { BusyInterval, DateOverride, EventTypeConfig, Slot, WeeklyRule } from "./types";

export function haySolapamiento(a: { start: Date; end: Date }, b: { start: Date; end: Date }): boolean {
  return isBefore(a.start, b.end) && isAfter(a.end, b.start);
}

export interface CalcularSlotsParams {
  weeklyRules: WeeklyRule[];
  overrides: DateOverride[];
  busy: BusyInterval[];
  eventType: EventTypeConfig;
  rangeStart: Date;
  rangeEnd: Date;
  hostTimezone: string;
  /** Inyectable para tests; por defecto `new Date()`. */
  now?: Date;
}

export function calcularSlotsDisponibles(params: CalcularSlotsParams): Slot[] {
  const { weeklyRules, overrides, busy, eventType, rangeStart, rangeEnd, hostTimezone } = params;
  const now = params.now ?? new Date();
  const earliestStart = addMinutes(now, eventType.minNoticeMinutes);

  const overridesByDate = new Map(overrides.map((o) => [o.date, o]));
  const rulesByDay = new Map<number, WeeklyRule[]>();
  for (const rule of weeklyRules) {
    const list = rulesByDay.get(rule.dayOfWeek) ?? [];
    list.push(rule);
    rulesByDay.set(rule.dayOfWeek, list);
  }

  const slots: Slot[] = [];
  const zonedRangeEnd = toZonedTime(rangeEnd, hostTimezone);
  let cursor = toZonedTime(rangeStart, hostTimezone);

  while (isBefore(startOfDay(cursor), zonedRangeEnd)) {
    const dateKey = format(cursor, "yyyy-MM-dd");
    const override = overridesByDate.get(dateKey);

    const windows = override
      ? override.isAvailable && override.startTime && override.endTime
        ? [{ startTime: override.startTime, endTime: override.endTime }]
        : []
      : (rulesByDay.get(cursor.getDay()) ?? []);

    for (const window of windows) {
      const windowStart = fromZonedTime(`${dateKey}T${window.startTime}:00`, hostTimezone);
      const windowEnd = fromZonedTime(`${dateKey}T${window.endTime}:00`, hostTimezone);

      slots.push(
        ...slotsDentroDeVentana({
          windowStart,
          windowEnd,
          busy,
          eventType,
          earliestStart,
          rangeStart,
          rangeEnd,
        }),
      );
    }

    cursor = addDays(cursor, 1);
  }

  return slots;
}

function slotsDentroDeVentana(params: {
  windowStart: Date;
  windowEnd: Date;
  busy: BusyInterval[];
  eventType: EventTypeConfig;
  earliestStart: Date;
  rangeStart: Date;
  rangeEnd: Date;
}): Slot[] {
  const { windowStart, windowEnd, busy, eventType, earliestStart, rangeStart, rangeEnd } = params;
  const slots: Slot[] = [];
  const step = eventType.durationMinutes;
  let candidateStart = windowStart;

  while (!isAfter(addMinutes(candidateStart, step), windowEnd)) {
    const candidateEnd = addMinutes(candidateStart, step);
    const bufferedStart = addMinutes(candidateStart, -eventType.bufferBeforeMin);
    const bufferedEnd = addMinutes(candidateEnd, eventType.bufferAfterMin);

    const overlapaConOcupado = busy.some((b) => haySolapamiento({ start: bufferedStart, end: bufferedEnd }, b));
    const respetaAvisoMinimo = !isBefore(candidateStart, earliestStart);
    const dentroDelRango = !isBefore(candidateStart, rangeStart) && !isAfter(candidateEnd, rangeEnd);

    if (!overlapaConOcupado && respetaAvisoMinimo && dentroDelRango) {
      slots.push({ start: candidateStart, end: candidateEnd });
    }

    candidateStart = addMinutes(candidateStart, step);
  }

  return slots;
}
