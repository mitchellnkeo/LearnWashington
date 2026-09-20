import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("stories index has no serious axe findings", async ({ page }) => {
  await page.goto("/stories");
  await expect(page.getByRole("heading", { name: "Stories" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeAttached();

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(serious).toEqual([]);
});
