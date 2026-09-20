import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PostcardDrawer } from "@/components/postcard/PostcardDrawer";
import { rainierPostcard } from "@/test/story-fixture";

afterEach(() => {
  cleanup();
});

describe("PostcardDrawer", () => {
  it("moves focus to Close and restores it after Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    function Harness() {
      return (
        <>
          <button type="button">Outside</button>
          <PostcardDrawer story={rainierPostcard} onClose={onClose} />
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps Tab inside the dialog", async () => {
    const user = userEvent.setup();
    render(<PostcardDrawer story={rainierPostcard} onClose={vi.fn()} />);

    const close = screen.getByRole("button", { name: "Close" });
    expect(close).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("link", { name: "U.S. Geological Survey" })).toHaveFocus();
  });

  it("keeps the postcard body in a scrollable region", () => {
    const { container } = render(
      <PostcardDrawer story={rainierPostcard} onClose={vi.fn()} />,
    );
    const scroller = container.querySelector(".overflow-y-auto");
    expect(scroller).toBeTruthy();
    expect(scroller).toHaveTextContent("Mount Rainier");
    expect(scroller).toHaveTextContent("Sources");
  });
});
