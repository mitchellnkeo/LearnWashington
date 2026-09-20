import { expect, test, type Page } from "@playwright/test";
import { mapStories, rainierPostcard, searchResults } from "./fixtures";

async function mockDiscovery(page: Page) {
  await page.route("**/api/map/stories**", async (route) => {
    await route.fulfill({ json: mapStories });
  });
  await page.route("**/api/search**", async (route) => {
    await route.fulfill({ json: searchResults });
  });
  await page.route("**/api/discovery/random**", async (route) => {
    await route.fulfill({ json: { slug: "mount-rainier" } });
  });
  await page.route("**/api/stories/mount-rainier", async (route) => {
    await route.fulfill({ json: rainierPostcard });
  });
}

test("search opens a postcard and a source", async ({ page }) => {
  await mockDiscovery(page);
  await page.goto("/");
  await page.getByLabel("Search stories, places, and topics").fill("rainier");
  await page.getByRole("option", { name: /Mount Rainier/ }).first().click();
  await expect(page.getByRole("heading", { name: "Mount Rainier" })).toBeVisible();
  await expect(page.getByRole("link", { name: "U.S. Geological Survey" })).toHaveAttribute(
    "href",
    "https://www.usgs.gov/volcanoes/mount-rainier",
  );
});

test("Surprise Me opens a postcard", async ({ page }) => {
  await mockDiscovery(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Surprise Me" }).click();
  await expect(page.getByRole("heading", { name: "Mount Rainier" })).toBeVisible();
  await expect(page).toHaveURL(/story=mount-rainier/);
});

test("category filters update the URL", async ({ page }) => {
  await mockDiscovery(page);
  await page.goto("/");
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page).toHaveURL(/category=history/);
});
