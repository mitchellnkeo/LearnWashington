import { describe, expect, it } from "vitest";
import { dateMatchesPrecision, formatDateLabel } from "./date-label";

describe("formatDateLabel", () => {
  it("prefers an explicit label", () => {
    expect(
      formatDateLabel({
        startDate: "1980-05-18",
        precision: "day",
        dateLabel: "May 18, 1980",
      }),
    ).toBe("May 18, 1980");
  });

  it("formats a day without inventing extra precision", () => {
    expect(
      formatDateLabel({ startDate: "1980-05-18", precision: "day" }),
    ).toBe("May 18, 1980");
  });

  it("formats month, year, decade, and approximate values", () => {
    expect(formatDateLabel({ startDate: "1933-12-01", precision: "month" })).toBe(
      "December 1933",
    );
    expect(formatDateLabel({ startDate: "1962-01-01", precision: "year" })).toBe("1962");
    expect(formatDateLabel({ startDate: "1980-01-01", precision: "decade" })).toBe(
      "1980s",
    );
    expect(
      formatDateLabel({ startDate: "1700-01-01", precision: "approximate" }),
    ).toBe("around 1700");
  });

  it("does not invent a label for geologic or unknown precision", () => {
    expect(formatDateLabel({ startDate: "15000-01-01", precision: "geologic" })).toBe(
      null,
    );
    expect(formatDateLabel({ startDate: "1800-01-01", precision: "unknown" })).toBe(
      null,
    );
  });
});

describe("dateMatchesPrecision", () => {
  it("requires a day when precision is day", () => {
    expect(dateMatchesPrecision("1980-05", "day")).toBe(false);
    expect(dateMatchesPrecision("1980-05-18", "day")).toBe(true);
  });

  it("requires a month when precision is month", () => {
    expect(dateMatchesPrecision("1980", "month")).toBe(false);
    expect(dateMatchesPrecision("1980-05", "month")).toBe(true);
  });
});
