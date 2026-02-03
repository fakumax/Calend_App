export interface WeeklyRule {
  dayOfWeek: number; // 0 = domingo ... 6 = sábado
  startTime: string; // "09:00"
  endTime: string; // "18:00"
}

export interface DateOverride {
  date: string; // "2026-01-20"
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

export interface BusyInterval {
  start: Date;
  end: Date;
}

export interface EventTypeConfig {
  durationMinutes: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  minNoticeMinutes: number;
  maxPerDay?: number;
}

export interface Slot {
  start: Date;
  end: Date;
}
