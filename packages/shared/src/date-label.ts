import type { DatePrecision } from "./enums";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type DateParts = {
  year: number;
  month?: number;
  day?: number;
};

export function parseIsoDateParts(value: string): DateParts | null {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : undefined;
  const day = match[3] ? Number(match[3]) : undefined;

  if (month !== undefined && (month < 1 || month > 12)) {
    return null;
  }
  if (day !== undefined && (day < 1 || day > 31)) {
    return null;
  }

  return { year, month, day };
}

export function formatDateLabel(input: {
  startDate?: string;
  endDate?: string;
  precision?: DatePrecision;
  dateLabel?: string;
}): string | null {
  const explicit = input.dateLabel?.trim();
  if (explicit) {
    return explicit;
  }

  if (!input.startDate) {
    return null;
  }

  const start = parseIsoDateParts(input.startDate);
  if (!start) {
    return null;
  }

  switch (input.precision) {
    case "day":
      if (start.month && start.day) {
        return `${MONTHS[start.month - 1]} ${start.day}, ${start.year}`;
      }
      return String(start.year);
    case "month":
      if (start.month) {
        return `${MONTHS[start.month - 1]} ${start.year}`;
      }
      return String(start.year);
    case "year":
      return String(start.year);
    case "decade":
      return `${Math.floor(start.year / 10) * 10}s`;
    case "century": {
      const century = Math.ceil(start.year / 100);
      return `${century}th century`;
    }
    case "approximate":
      return `around ${start.year}`;
    case "geologic":
    case "unknown":
    case undefined:
      return null;
    default:
      return null;
  }
}

export function dateMatchesPrecision(
  startDate: string | undefined,
  precision: DatePrecision | undefined,
): boolean {
  if (!startDate || !precision) {
    return true;
  }

  const parts = parseIsoDateParts(startDate);
  if (!parts) {
    return false;
  }

  if (precision === "day") {
    return Boolean(parts.month && parts.day);
  }
  if (precision === "month") {
    return Boolean(parts.month);
  }

  return true;
}
