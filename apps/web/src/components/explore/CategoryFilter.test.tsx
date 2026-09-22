import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CategoryFilter } from "@/components/explore/CategoryFilter";

afterEach(() => {
  cleanup();
});

describe("CategoryFilter", () => {
  it("tells the parent when a category is chosen", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CategoryFilter category={null} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: "Music & Culture" }));
    expect(onSelect).toHaveBeenCalledWith("music-culture");
    await user.click(screen.getByRole("button", { name: "Pop Culture" }));
    expect(onSelect).toHaveBeenCalledWith("pop-culture");
  });

  it("marks the active category", () => {
    render(<CategoryFilter category="history" onSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: "History" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
