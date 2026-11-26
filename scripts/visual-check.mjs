import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
const baseURL = process.env.TIMBREL_TEST_URL || "http://127.0.0.1:3000";
await mkdir("artifacts/screenshots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const routes = [
  "/",
  "/admin",
  "/admin/leads",
  "/admin/marketing",
  "/admin/quotes",
  "/admin/customers",
  "/admin/calendar",
  "/admin/events",
  "/admin/events/EVT-0124",
  "/admin/crew",
  "/admin/equipment",
  "/admin/equipment/CAM-001",
  "/admin/production",
  "/admin/galleries",
  "/admin/galleries/GAL-0118",
  "/admin/finance",
  "/admin/reports",
  "/admin/settings",
  "/freelancer",
  "/freelancer/jobs",
  "/freelancer/gear",
  "/freelancer/payouts",
  "/client",
  "/client/gallery/GAL-0118",
  "/print/quote/Q-0124",
];
const results = [];
for (const route of routes) {
  const response = await page.goto(`${baseURL}${route}`);
  await page.locator("h1").first().waitFor({ state: "visible" });
  await page.locator("body").waitFor();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  results.push({ route, status: response.status(), overflow });
  console.log(`${response.status()} ${route} ${overflow ? "OVERFLOW" : ""}`);
}
for (const [name, route, width, height] of [
  ["dashboard-desktop", "/admin", 1440, 900],
  ["event-desktop", "/admin/events/EVT-0124", 1440, 900],
  ["equipment-desktop", "/admin/equipment", 1440, 900],
  ["gallery-desktop", "/client/gallery/GAL-0118", 1440, 900],
  ["freelancer-mobile", "/freelancer", 390, 844],
  ["gallery-mobile", "/client/gallery/GAL-0118", 390, 844],
  ["dashboard-mobile", "/admin", 390, 844],
  ["dashboard-1280", "/admin", 1280, 800],
  ["dashboard-1024", "/admin", 1024, 768],
  ["dashboard-tablet", "/admin", 768, 1024],
]) {
  await page.setViewportSize({ width, height });
  await page.goto(`${baseURL}${route}`);
  await page.waitForTimeout(350);
  await page.screenshot({
    path: `artifacts/screenshots/${name}.png`,
    fullPage: true,
  });
  results.push({
    screenshot: name,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  });
}
const contrast = await page.evaluate(() => {
  const style = getComputedStyle(document.documentElement);
  const luminance = (token) => {
    const raw = style.getPropertyValue(token).trim().replace("#", "");
    const hex =
      raw.length === 3
        ? raw
            .split("")
            .map((c) => c + c)
            .join("")
        : raw;
    const rgb = [0, 2, 4]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  return [
    ["--ink", "--surface"],
    ["--ink-secondary", "--canvas"],
    ["--ink-muted", "--surface"],
    ["--accent-ink", "--surface"],
    ["--primary-foreground", "--primary"],
    ["--sidebar-muted", "--sidebar"],
    ["--sidebar-ink", "--sidebar-active"],
    ["--success-ink", "--success-bg"],
    ["--warning-ink", "--warning-bg"],
    ["--danger-ink", "--danger-bg"],
    ["--info-ink", "--info-bg"],
    ["--neutral-ink", "--neutral-bg"],
  ].map(([foreground, background]) => {
    const a = luminance(foreground),
      b = luminance(background),
      ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    return {
      foreground,
      background,
      ratio: Number(ratio.toFixed(2)),
      pass: ratio >= 4.5,
    };
  });
});
await writeFile(
  "artifacts/visual-report.json",
  JSON.stringify({ results, errors, contrast }, null, 2),
);
await browser.close();
const composites = [];
for (let i = 1; i <= 12; i++)
  composites.push({
    input: await sharp(
      `public/demo-media/wedding-${String(i).padStart(2, "0")}.webp`,
    )
      .resize(300, 210, { fit: "cover" })
      .png()
      .toBuffer(),
    left: ((i - 1) % 4) * 300,
    top: Math.floor((i - 1) / 4) * 235,
  });
await sharp({
  create: { width: 1200, height: 705, channels: 3, background: "#ffffff" },
})
  .composite(composites)
  .png()
  .toFile("artifacts/stock-contact-sheet.png");
console.log(
  JSON.stringify(
    { errors, overflows: results.filter((r) => r.overflow) },
    null,
    2,
  ),
);
if (
  errors.length ||
  results.some((r) => r.overflow) ||
  contrast.some((c) => !c.pass)
)
  process.exitCode = 1;
