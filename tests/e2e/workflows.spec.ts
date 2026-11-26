import { test, expect, type Page } from "@playwright/test";
import type { DemoState } from "../../lib/demo/types";
const state = (page: Page): Promise<DemoState> =>
  page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("timbrel-studio-demo-v1")!).state.data,
  );
async function role(page: Page, name: string) {
  await page.getByRole("button", { name: "Demo workspace" }).click();
  await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
}
const dialog = (page: Page) => page.getByRole("dialog").last();
async function save(page: Page) {
  await dialog(page).getByRole("button", { name: "Save changes" }).click();
}
test.beforeEach(async ({ page }) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Studio overview" }),
  ).toBeVisible();
});
test("lead → revised quote → held booking → advance → confirmed booking persists", async ({
  page,
}) => {
  await page.goto("/admin/leads");
  await page.getByRole("button", { name: "New enquiry" }).click();
  let form = dialog(page);
  await form.getByLabel("Customer name").fill("Demo Asha & Hari");
  await form
    .getByLabel("Email", { exact: true })
    .fill("asha-flow@example.test");
  await form.getByLabel("Event date (optional)").fill("2026-12-20");
  await save(page);
  await page.getByRole("button", { name: /Demo Asha & Hari/ }).click();
  await dialog(page).getByRole("button", { name: "Log follow-up" }).click();
  await dialog(page)
    .getByLabel("Call / message / note")
    .fill("Discussed the four-session package");
  await save(page);
  await dialog(page).getByRole("button", { name: "Create quote" }).click();
  await expect(
    dialog(page).getByRole("heading", { name: /Demo Asha/ }),
  ).toBeVisible();
  await dialog(page).getByLabel("Discount in rupees").fill("5000");
  await dialog(page).getByRole("button", { name: "Mark sent · demo" }).click();
  await dialog(page)
    .getByRole("button", { name: "Accept quote · demo" })
    .click();
  await dialog(page)
    .getByRole("button", { name: "Create held booking" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Demo Asha & Hari Wedding" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Confirm booking", exact: true })
    .click();
  await expect(page.locator('.toast[role="alert"]')).toContainText(
    "Verified collections",
  );
  await page.getByRole("tab", { name: "Finance", exact: true }).click();
  await page
    .getByRole("button", { name: "Record collection", exact: true })
    .click();
  form = dialog(page);
  await form.getByLabel("Amount (₹)").fill("50000");
  await form.getByLabel("Reference", { exact: true }).fill("FLOW-ADV-001");
  await save(page);
  await page
    .getByRole("button", { name: "Confirm booking", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Demo Asha & Hari Wedding" }),
  ).toBeVisible();
  const data = await state(page);
  const booking = data.bookings.find(
    (b) => b.name === "Demo Asha & Hari Wedding",
  )!;
  expect(booking.status).toBe("Confirmed");
  expect(booking.contract).toBe(14500000);
  expect(data.quotes.find((q) => q.id === booking.quoteId)?.bookingId).toBe(
    booking.id,
  );
});
test("overlapping crew and equipment show errors; valid alternatives reserve", async ({
  page,
}) => {
  await page.goto("/admin/events/EVT-0124?tab=Sessions");
  const wedding = page.locator(".panel").filter({
    has: page.getByRole("heading", { name: "Wedding", exact: true }),
  });
  await wedding
    .getByRole("button", { name: "Assign crew", exact: true })
    .click();
  await dialog(page).getByLabel("Crew member").selectOption("F-003");
  await save(page);
  await expect(dialog(page).getByRole("alert")).toContainText(
    "Already assigned",
  );
  await dialog(page).getByLabel("Crew member").selectOption("F-004");
  await save(page);
  await wedding
    .getByRole("button", { name: "Reserve gear", exact: true })
    .click();
  await dialog(page)
    .getByLabel("Equipment", { exact: true })
    .selectOption("CAM-002");
  await save(page);
  await expect(dialog(page).getByRole("alert")).toContainText("Reserved");
  await dialog(page)
    .getByLabel("Equipment", { exact: true })
    .selectOption("CAM-001");
  await save(page);
  const data = await state(page);
  expect(
    data.assignments.some(
      (a) => a.crewId === "F-004" && a.sessionId === "S-003",
    ),
  ).toBe(true);
  expect(
    data.reservations.some(
      (r) => r.assetId === "CAM-001" && r.sessionId === "S-003",
    ),
  ).toBe(true);
});
test("reserve → issue → freelancer acknowledgement → damaged return preserves other custody", async ({
  page,
}) => {
  await page.goto("/admin/equipment");
  await expect(
    page
      .locator(".metric")
      .filter({ hasText: "With crew" })
      .locator(".metric-value"),
  ).toHaveText("2");
  await page.getByRole("tab", { name: "Reservations", exact: true }).click();
  await page.getByRole("button", { name: "Reserve", exact: true }).click();
  await dialog(page)
    .getByLabel("Session", { exact: true })
    .selectOption("S-014");
  await dialog(page)
    .getByLabel("Equipment", { exact: true })
    .selectOption("CAM-001");
  await save(page);
  await page.getByRole("button", { name: "Issue gear", exact: true }).click();
  await save(page);
  await role(page, "Freelancer workspace");
  await page.getByRole("link", { name: "Gear", exact: true }).click();
  const card = page.locator(".job-card").filter({
    has: page.getByRole("heading", { name: "Sony A7 IV", exact: true }),
  });
  await card.getByRole("button", { name: "Acknowledge gear" }).click();
  await card.getByRole("button", { name: "Request return" }).click();
  await role(page, "Owner workspace");
  await page.goto("/admin/equipment");
  await page.getByRole("tab", { name: "Issue & return", exact: true }).click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByRole("link", { name: /^CAM-001/ }) });
  await row.getByRole("button", { name: /inspect/i }).click();
  await dialog(page).getByLabel("Inspection outcome").selectOption("Damaged");
  await dialog(page)
    .getByLabel("Condition / inspection note")
    .fill("Screen scratched; quarantine for assessment");
  await save(page);
  const data = await state(page);
  expect(data.assets.find((a) => a.id === "CAM-001")?.condition).toBe(
    "Under inspection",
  );
  expect(data.issues.find((i) => i.assetId === "CAM-001")?.acknowledged).toBe(
    true,
  );
  expect(data.issues.find((i) => i.assetId === "LEN-006")?.status).toBe(
    "Issued",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Equipment register" }),
  ).toBeVisible();
});
test("freelancer acceptance updates owner readiness without exposing other rates", async ({
  page,
}) => {
  await role(page, "Freelancer workspace");
  await page.getByRole("link", { name: "Jobs", exact: true }).click();
  await page.getByRole("button", { name: "Accept job", exact: true }).click();
  await expect(
    page.locator(".job-card").filter({ hasText: "2 Dec 2026" }),
  ).toContainText("Accepted");
  expect(await page.getByText("Prakash Ravi", { exact: true }).count()).toBe(0);
  await role(page, "Owner workspace");
  await page.goto("/admin/events/EVT-0124?tab=Team");
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "Arun Kumar" })
      .filter({ hasText: "Pre-wedding" }),
  ).toContainText("Accepted");
});
test("review, changes, approval, media handover and deliverable release", async ({
  page,
}) => {
  async function changeTask(id: string, status: string, note = "") {
    await page.goto(`/admin/production?task=${id}`);
    await dialog(page).getByLabel("Move production task").selectOption(status);
    if (note)
      await dialog(page)
        .getByLabel("Review / revision / blocked note")
        .fill(note);
    await save(page);
  }
  await changeTask("T-002", "Changes requested", "Please adjust skin tones");
  await changeTask("T-002", "Review");
  await changeTask("T-002", "Approved");
  await changeTask("T-001", "Review");
  await changeTask("T-001", "Approved");
  await changeTask("T-005", "In progress");
  await changeTask("T-005", "Review");
  await changeTask("T-005", "Approved");
  await page.goto("/admin/production");
  await page.getByRole("tab", { name: "Media handovers", exact: true }).click();
  await page.getByRole("button", { name: "Record handover" }).click();
  await save(page);
  await page.getByRole("tab", { name: "Deliverables", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "D-2-photo" });
  await row.getByRole("button", { name: "Mark ready" }).click();
  await row.getByRole("button", { name: "Release", exact: true }).click();
  await row.getByRole("button", { name: "Confirm delivered" }).click();
  expect(
    (await state(page)).deliverables.find((d) => d.id === "D-2-photo")?.status,
  ).toBe("Delivered");
  expect((await state(page)).handovers.length).toBe(2);
});
test("customer favorites, keyboard lightbox and six selections round-trip to owner", async ({
  page,
}) => {
  await role(page, "Customer experience");
  await page
    .getByRole("link", { name: "Your photographs", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Favorite KM_0001.jpg", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open KM_0001.jpg", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog")).toContainText("KM_0002.jpg");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  for (let i = 1; i <= 6; i++)
    await page
      .getByRole("button", {
        name: `Select KM_${String(i).padStart(4, "0")}.jpg for album`,
        exact: true,
      })
      .click();
  await page
    .getByRole("button", { name: "Submit selection", exact: true })
    .click();
  await dialog(page)
    .getByRole("button", { name: "Confirm album selection" })
    .click();
  await expect(
    page.getByRole("button", { name: "Submitted", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Submitted", exact: true }),
  ).toBeDisabled();
  await role(page, "Owner workspace");
  await page.goto("/admin/galleries/GAL-0118");
  await expect(
    page.getByText("PHOTO-006 (KM_0006.jpg)", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reopen selection" }).click();
  expect((await state(page)).galleries[0].submitted).toBe(false);
});
test("part collection, reversal and partial payout keep exact ledger balances", async ({
  page,
}) => {
  await page.goto("/admin/finance");
  await page
    .getByRole("button", { name: "Record collection", exact: true })
    .click();
  await dialog(page).getByLabel("Amount (₹)").fill("25000");
  await dialog(page).getByLabel("Reference", { exact: true }).fill("PART-E2E");
  await save(page);
  const row = page.getByRole("row").filter({ hasText: "PART-E2E" });
  await expect(
    page
      .getByRole("row")
      .filter({
        has: page.getByRole("link", { name: /Rahul & Priya Wedding/ }),
      })
      .first(),
  ).toContainText("₹75,000");
  await row.getByRole("button", { name: "Reverse", exact: true }).click();
  await dialog(page)
    .getByLabel("Reversal reason")
    .fill("Entered against wrong booking");
  await save(page);
  const data = await state(page);
  expect(
    data.transactions.filter((t) => t.bookingId === "EVT-0124"),
  ).toHaveLength(3);
  await page.getByRole("tab", { name: "Crew payouts" }).click();
  const crew = page.getByRole("row").filter({ hasText: "A-003" });
  await crew.getByRole("button", { name: "Record payout" }).click();
  await dialog(page).getByLabel("Amount (₹)").fill("3000");
  await save(page);
  await expect(crew).toContainText("₹5,000");
});
test("sample campaign intake is idempotent and spend editing recalculates", async ({
  page,
}) => {
  await page.goto("/admin/marketing");
  await page.getByRole("button", { name: "Receive sample lead" }).click();
  await page.getByRole("button", { name: "Receive sample lead" }).click();
  await expect(page.locator('.toast[role="alert"]')).toContainText(
    "already received",
  );
  expect(
    (await state(page)).leads.filter(
      (l) => l.externalId === "meta-demo-2026-001",
    ),
  ).toHaveLength(1);
  await page.getByRole("button", { name: "Edit spend" }).first().click();
  await dialog(page).getByLabel("Spend (₹)").fill("20000");
  await save(page);
  expect((await state(page)).campaigns[0].spend).toBe(2000000);
});
test("upload retry, publish, expiry and record scoping work", async ({
  page,
}) => {
  await page.goto("/admin/galleries/GAL-0120");
  await page
    .getByRole("button", { name: "Simulate interrupted upload" })
    .click();
  await page
    .getByRole("button", { name: "Publish gallery", exact: true })
    .click();
  await expect(page.locator('.toast[role="alert"]')).toContainText(
    "Resolve all uploads",
  );
  await page.getByRole("button", { name: "Failed · Retry upload" }).click();
  await page
    .getByRole("button", { name: "Publish gallery", exact: true })
    .click();
  await role(page, "Customer experience");
  await page.goto("/client/gallery/GAL-0120");
  await expect(
    page.getByText("This gallery belongs to another customer.", {
      exact: true,
    }),
  ).toBeVisible();
  await role(page, "Owner workspace");
  await page.goto("/admin/galleries/GAL-0118");
  await page.getByRole("button", { name: "Simulate access expiry" }).click();
  await role(page, "Customer experience");
  await page.goto("/client/gallery/GAL-0118");
  await expect(page.getByText(/Gallery expired/)).toBeVisible();
});
test("CSV import preview and filtered exports contain actual rows", async ({
  page,
}) => {
  await page.goto("/admin/leads");
  await page.getByRole("button", { name: "Import CSV" }).click();
  await dialog(page)
    .getByLabel("CSV contents")
    .fill(
      "name,email,service,location\nCSV Demo,csv@example.test,Wedding,Chennai\nBad Email,bad,Wedding,Chennai",
    );
  await expect(
    dialog(page).getByText(/2 rows · 1 structurally valid · 1 errors/),
  ).toBeVisible();
  await dialog(page).getByRole("button", { name: "Import 2 rows" }).click();
  await expect(dialog(page).getByRole("status")).toContainText(
    "1 imported; 1 rejected",
  );
  await dialog(page).getByRole("button", { name: "Close dialog" }).click();
  await page.goto("/admin/reports");
  await page.getByLabel("Report service area").selectOption("Chennai");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export filtered CSV" }).click();
  expect((await download).suggestedFilename()).toBe("event-contribution.csv");
});
test("global search, empty filter, mobile navigation and reset restore exact seed", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Search anything…" }).click();
  await dialog(page)
    .getByPlaceholder("Lead, customer, booking, equipment or crew")
    .fill("CAM-002");
  await dialog(page)
    .getByRole("link", { name: /Sony A7S III/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sony A7S III" }),
  ).toBeVisible();
  await page.goto("/admin/leads");
  await page
    .getByPlaceholder("Search name, service or enquiry ID…")
    .fill("No such lead");
  await expect(page.locator(".board-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await expect(page.locator(".sidebar")).toHaveCSS("width", "72px");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await dialog(page)
    .getByRole("button", { name: "Reset demo", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Studio overview" }),
  ).toBeVisible();
  const data = await state(page);
  expect(data.sequence).toBe(1000);
  expect(data.galleries[0].selected).toEqual([]);
  expect(data.readNotifications).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
test("corrupt browser data recovers and unavailable storage keeps the session usable", async ({
  page,
}) => {
  await page.evaluate(() =>
    localStorage.setItem("timbrel-studio-demo-v1", "{corrupt"),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Studio overview" }),
  ).toBeVisible();
  await expect(page.locator(".storage-warning")).toContainText(
    "could not be read",
  );
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Storage full", "QuotaExceededError");
    };
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Studio overview" }),
  ).toBeVisible();
  await expect(page.locator(".storage-warning")).toContainText("session only");
  await page.goto("/admin/marketing");
  await page.getByRole("button", { name: "Receive sample lead" }).click();
  await expect(page.locator(".toast")).toContainText(
    "Sample Meta lead received",
  );
});
test("refunds and accepted quote revisions update connected financial records without duplicate bookings", async ({
  page,
}) => {
  await page.goto("/admin/finance");
  await page
    .getByRole("button", { name: "Record refund", exact: true })
    .click();
  await dialog(page)
    .getByLabel("Refund reference / reason")
    .fill("REFUND-DEMO-TEST");
  await save(page);
  expect((await state(page)).transactions[0].kind).toBe("Refund");
  await page.goto("/admin/quotes?quote=Q-0124");
  await dialog(page).getByRole("button", { name: "New revision" }).click();
  await dialog(page).getByLabel("Discount in rupees").fill("1000");
  await dialog(page).getByRole("button", { name: "Mark sent · demo" }).click();
  await dialog(page)
    .getByRole("button", { name: "Accept quote · demo" })
    .click();
  await expect(
    dialog(page).getByRole("link", { name: "Open linked booking" }),
  ).toBeVisible();
  const data = await state(page);
  expect(data.bookings).toHaveLength(8);
  expect(data.bookings[0].contract).toBe(14900000);
  expect(data.quotes.find((q) => q.id === "Q-0124")?.items[0].rate).toBe(
    15000000,
  );
});
test("draft quote revisions remain private to the owner", async ({ page }) => {
  await page.goto("/admin/quotes?quote=Q-0124");
  await dialog(page).getByRole("button", { name: "New revision" }).click();
  const revision = (await state(page)).quotes[0];
  await dialog(page).getByRole("button", { name: "Close dialog" }).click();
  await page.goto("/admin/settings");
  await page.getByLabel("Customer identity").selectOption("C-001");
  await role(page, "Customer experience");
  await expect(
    page.getByRole("heading", { name: "Hello, Rahul & Priya." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: new RegExp(revision.id) }),
  ).toHaveCount(0);
  await page.goto(`/print/quote/${revision.id}`);
  await expect(
    page.getByRole("heading", {
      name: "Quote unavailable for this demo identity",
    }),
  ).toBeVisible();
});
