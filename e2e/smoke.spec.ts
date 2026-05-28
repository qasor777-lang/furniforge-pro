import { test, expect } from "@playwright/test";

test.describe("Core user journey", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FurniForge/);
  });

  test("catalog page lists models", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.locator("text=Mebel katalogi")).toBeVisible();
    await expect(page.locator("text=parametric model")).toBeVisible();
  });

  test("health endpoint returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.ts).toBeDefined();
  });
});
