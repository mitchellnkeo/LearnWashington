import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CategoryResults } from "./CategoryResults";

afterEach(() => {
  cleanup();
});

const fireStory = {
  slug: "great-seattle-fire-1889",
  title: "Great Seattle Fire",
  hook: "A glue pot tipped over and the city rebuilt in brick.",
  locationLabel: "Seattle · King County",
  dateLabel: "1889",
  region: "Puget Sound",
  categories: [{ slug: "history", name: "History" }],
  image: null,
};

describe("CategoryResults", () => {
  it("opens a listed postcard and can clear the category", async () => {
    const user = userEvent.setup();
    const onSelectStory = vi.fn();
    const onSelectCategory = vi.fn();

    render(
      <CategoryResults
        category="history"
        stories={[fireStory]}
        selectedSlug={null}
        loading={false}
        onSelectCategory={onSelectCategory}
        onSelectStory={onSelectStory}
      />,
    );

    expect(screen.getByText("1 postcard")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Great Seattle Fire/ }));
    expect(onSelectStory).toHaveBeenCalledWith("great-seattle-fire-1889");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onSelectCategory).toHaveBeenCalledWith(null);
  });
});
