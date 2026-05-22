import { test, expect } from "@playwright/test";

test.describe("PocketLawyer smoke", () => {
  test("homepage loads with branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/PocketLawyer/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sign-in page renders auth form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("button", { name: /log in|sign in|connexion/i })).toBeVisible();
  });

  test("health API responds with status payload", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(["healthy", "unhealthy"]).toContain(body.status);
  });

  test("chat page loads for guests", async ({ page }) => {
    await page.goto("/chat");
    await expect(
      page.getByPlaceholder(/Type your legal question|Posez votre question/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test("removed duplicate routes return 404", async ({ request }) => {
    for (const path of ["/sign-in-new", "/sign-up-new"]) {
      const response = await request.get(path);
      expect(response.status()).toBe(404);
    }
  });
});
