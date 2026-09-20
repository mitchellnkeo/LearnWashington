import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExplorerChrome } from "@/components/explore/ExplorerChrome";

afterEach(() => {
  cleanup();
});

describe("ExplorerChrome", () => {
  it("keeps the map clear until Explore is opened", async () => {
    const user = userEvent.setup();
    render(
      <ExplorerChrome
        category={null}
        onSelectCategory={vi.fn()}
        onSelectStory={vi.fn()}
        onError={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText("Search stories, places, and topics")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Explore" }));
    expect(screen.getByLabelText("Search stories, places, and topics")).toBeVisible();
    expect(screen.getByRole("button", { name: /^History$/ })).toBeVisible();
  });
});
