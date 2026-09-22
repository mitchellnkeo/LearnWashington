import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WelcomeMail } from "./WelcomeMail";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
});

describe("WelcomeMail", () => {
  it("opens the postcard and offers the map", async () => {
    const user = userEvent.setup();
    render(<WelcomeMail />);

    await user.click(
      screen.getByRole("button", { name: "Open the mail from Washington to you" }),
    );

    expect(
      screen.getByRole("heading", { name: "Hello from Washington!" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Open the map" })).toBeVisible();
  });
});
