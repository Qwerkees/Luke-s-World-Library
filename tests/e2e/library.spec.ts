import { expect, test } from "@playwright/test";

test("home page and primary library navigation render", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/LUKE'S WORLD LIBRARY/i);
  await expect(page.getByRole("heading", { name: /Knowledge has no boundaries/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Search beyond the shelves/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Choose your way in/i })).toBeVisible();
});

test("World Explorer changes country content", async ({ page }) => {
  await page.goto("/");
  await page.locator(".two select").selectOption("Japan");
  await expect(page.getByText(/island nation with deep traditions/i)).toBeVisible();
  await expect(page.getByText(/Tokugawa era and modern Japan/i)).toBeVisible();
});

test("Time Machine and Knowledge Map interactions work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Time Machine/i }).click();
  await expect(page.getByRole("heading", { name: /History is a living timeline/i })).toBeVisible();
  await page.getByRole("button", { name: /Knowledge Map/i }).click();
  await expect(page.getByRole("heading", { name: /Every idea has a history/i })).toBeVisible();
  await page.getByRole("button", { name: /Engineering/i }).last().click();
  await expect(page.getByRole("heading", { name: "Engineering", exact: true })).toBeVisible();
});

test("Teach Me gives feedback after an answer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Teach Me/i }).click();
  await expect(page.getByText(/Which region is strongly associated/i)).toBeVisible();
  await page.getByRole("button", { name: /Mesopotamia/i }).click();
  await expect(page.getByText("Correct.")).toBeVisible();
  await expect(page.getByRole("button", { name: /NEXT QUESTION/i })).toBeVisible();
});

test("catalogue search renders returned records", async ({ page }) => {
  await page.route("**/api/search?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        query: "computer science",
        sources: { openLibrary: true, libraryOfCongress: true },
        results: [
          {
            source: "Test catalogue",
            title: "Computer Science: A Test Record",
            detail: "A controlled fixture for the browser test.",
            url: "https://example.org/record",
          },
        ],
      }),
    });
  });

  await page.goto("/");
  await page.getByLabel(/Search books, people, subjects, or topics/i).fill("computer science");
  await page.getByRole("button", { name: /Search catalogues/i }).click();
  await expect(page.getByRole("heading", { name: "Computer Science: A Test Record" })).toBeVisible();
  await expect(page.getByText("1 CATALOGUE RECORDS")).toBeVisible();
});

test("QR page exposes separate application and source-code QR downloads", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /SHARE \/ QR/i }).click();
  await expect(page.getByText(/Two separate QR codes/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /DOWNLOAD LIBRARY QR/i })).toHaveAttribute("href", "/api/qr?target=library");
  await expect(page.getByRole("link", { name: /DOWNLOAD GITHUB QR/i })).toHaveAttribute("href", "/api/qr?target=github");
});

test("Library Navigator routes to the six main destinations", async ({ page }) => {
  await page.goto("/");
  const navigator = page.getByRole("navigation", { name: "Library destinations" });
  await expect(navigator.getByRole("link", { name: /Browse departments/i })).toHaveAttribute("href", "#departments");
  await expect(navigator.getByRole("link", { name: /Explore the world/i })).toHaveAttribute("href", "#continents");
  await expect(navigator.getByRole("link", { name: /Search the catalogue/i })).toHaveAttribute("href", "#library-search");
  await expect(navigator.getByRole("link", { name: /Open research vault/i })).toHaveAttribute("href", "#research");
  await expect(navigator.getByRole("link", { name: /Learn and practice/i })).toHaveAttribute("href", "#learning-studio");
  await expect(navigator.getByRole("link", { name: /My library and progress/i })).toHaveAttribute("href", "#my-library");
});
