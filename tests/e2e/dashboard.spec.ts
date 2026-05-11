import { test, expect } from "@playwright/test";

test("create destination, create api key, send event, and see it in dashboard", async ({ page, request }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");

  await page.goto("/dashboard/destinations");
  const destinationResponse = page.waitForResponse((response) => response.url().includes("/api/destinations/demo") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Create demo sink" }).click();
  expect((await destinationResponse).ok()).toBeTruthy();
  await expect(page.getByText("PulsePipe demo sink").first()).toBeVisible({ timeout: 15_000 });

  await page.goto("/dashboard/api-keys");
  await page.getByPlaceholder("Production ingestion").fill("E2E key");
  await page.getByRole("button", { name: "Create" }).click();
  const rawKey = await page.locator("code").first().innerText();

  const response = await request.post("/api/v1/events", {
    headers: { Authorization: `Bearer ${rawKey}` },
    data: {
      event: "user.created",
      userId: "e2e_user",
      timestamp: "2026-01-01T00:00:00.000Z",
      properties: { plan: "pro" }
    }
  });
  expect(response.ok()).toBeTruthy();

  await page.goto("/dashboard/events");
  await expect(page.getByText("user.created").first()).toBeVisible();
});
