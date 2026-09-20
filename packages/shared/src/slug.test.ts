import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("turns a title into kebab-case", () => {
    expect(slugify("Mount St. Helens 1980 Eruption")).toBe(
      "mount-st-helens-1980-eruption",
    );
  });

  it("strips diacritics", () => {
    expect(slugify("Tahoma — the mountain")).toBe("tahoma-the-mountain");
  });

  it("collapses punctuation and spaces", () => {
    expect(slugify("  Ice Age   Floods!  ")).toBe("ice-age-floods");
  });
});
