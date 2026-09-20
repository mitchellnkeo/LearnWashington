import { afterEach, describe, expect, it, vi } from "vitest";
import { debounce } from "@/lib/debounce";

afterEach(() => {
  vi.useRealTimers();
});

describe("debounce", () => {
  it("does not fire after cancel", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const delayed = debounce(fn, 350);
    delayed();
    delayed.cancel();
    vi.advanceTimersByTime(400);
    expect(fn).not.toHaveBeenCalled();
  });
});
