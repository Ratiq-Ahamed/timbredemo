# Timbrel Studio OS

A local, connected sales prototype for a photography studio: owner operations, mobile freelancer work, and a customer project/gallery experience. All business records, names, contacts and payments are synthetic. The supplied Timbrel Tales logo is used unchanged with the user's approval for this local demo.

## Run

Node 22 is available in the inspected environment. Install with `npm.cmd ci` on Windows (or `npm ci` elsewhere), then run:

```powershell
npm.cmd run dev
```

Open http://127.0.0.1:3000. If another process occupies the port, use the URL printed by Next.js. PowerShell in this environment blocks the `npm.ps1` wrapper; `npm.cmd` works without changing execution policy.

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd start
```

Browser tests use a running application at port 3000 and installed Chrome:

```powershell
npm.cmd run test:e2e
node scripts/visual-check.mjs
```

For an isolated production check, run `npm.cmd start -- --port 3100` after building, then set `$env:TIMBREL_TEST_URL='http://127.0.0.1:3100'` in the test terminal. Development output uses `.next/`; production uses `.next-production/`, allowing verification without replacing the active development cache.

The visual check writes screenshots and a route/overflow/error report under `artifacts/`. Tests create isolated browser contexts and never alter another browser's saved demo.

## Netlify deployment

The Next.js app lives at the repository root. `netlify.toml` sets the build command to `npm run build` and the publish directory to `.next-production`, matching the production `distDir` in `next.config.ts`. This file overrides the Netlify UI publish setting; using `.next` there caused the adapter to report a missing publish directory after a successful build.

Keep Netlify's Next.js runtime enabled for the server-rendered routes. Build output stays ignored by Git because Netlify generates it during deployment.

## Workspaces and routes

| Workspace | Routes |
| --- | --- |
| Entry | `/` |
| Owner | `/admin`, `/admin/leads`, `/admin/marketing`, `/admin/quotes`, `/admin/customers`, `/admin/calendar`, `/admin/events`, `/admin/events/[id]`, `/admin/crew`, `/admin/equipment`, `/admin/equipment/[id]`, `/admin/production`, `/admin/galleries`, `/admin/galleries/[id]`, `/admin/finance`, `/admin/reports`, `/admin/settings` |
| Freelancer | `/freelancer`, `/freelancer/jobs`, `/freelancer/gear`, `/freelancer/payouts` |
| Customer | `/client`, `/client/gallery/[id]` |
| Printable quote | `/print/quote/[id]` |

Use **Demo workspace** to switch experiences without entering credentials. Default freelancer: **F-001, Arun Kumar**. Default customer: **C-002, Kavin & Meera**. Choose another sample identity in Settings before switching roles. An owner opening a portal directly sees an explicitly labeled preview scoped to the selected identity.

## Connected feature map

- Searchable lead pipeline/list, follow-up activity, duplicate contact warning, mapped CSV import/preview/errors, simulated idempotent campaign intake, manual spend editing.
- Itemized quotes, catalogue pricing snapshots, optional extras, discount/sample tax, revisions, acceptance, held conversion, advance-gated confirmation, printable proposals.
- Multi-session bookings, calendar, crew skills and time conflict checks, rate snapshots, reservations, cancellation/refund review and atomic reschedule validation.
- Serialised equipment, kit templates, manual/demo QR scanning, printable real asset QR codes, named custody, acknowledgement, partial returns, quarantine, maintenance and movement history.
- Parallel production tasks, reviews/revisions, media handover and manually confirmed backup metadata, digital and physical deliverable milestones.
- Gallery access states, cover/sections, interrupted upload/retry simulation, local file preview, favorites, stable-ID album selection, submission/reopening and sample manifest download.
- Verified collections, partial payouts, approved expenses, auditable reversals, planned contribution, reports/CSV exports, derived alerts and global search.

## State, calculations and demo clock

`lib/demo/types.ts` defines the normalized records. `seed.ts` creates deterministic fictional scenarios; `actions.ts` validates mutations against a cloned state and returns typed success/error results. Selectors compute balances, conflicts, readiness and notifications. Zustand persists the shared model in `timbrel-studio-demo-v1` localStorage using a versioned envelope and an SSR hydration boundary. Corrupt/incompatible storage recovers to a fresh seed; storage-write failure leaves the session usable with a visible warning.

Money is stored as integer paise; locale is `en-IN`; timestamps display in `Asia/Kolkata`. The fixed clock is **24 November 2026, 10:00 IST**. It does not advance with wall time. Resource overlap uses half-open intervals and a configurable 30-minute default travel/setup buffer.

**EVT-0124, Rahul & Priya:** ₹1,50,000 contract, ₹50,000 verified advance, ₹1,00,000 remaining, ₹82,500 planned direct costs, ₹67,500 planned contribution (45%). Collections are cash flow, not contribution. Paid actual costs and planned costs have separate labels. Quotes with sample tax retain a separate net calculation for contribution.

Quote conversion creates one held booking. Confirmation requires verified collections covering its initial milestone, defaulting to one-third of the original quote total and editable on the draft. There is no silent exception or duplicate conversion.

Use **EVT-0122 / S-014, Studio Collective Portraits**, for current-day custody demonstrations. Future wedding gear can be reserved but cannot be issued early. CAM-002 and F-003 deliberately conflict with the Dec 6 wedding; CAM-001 and F-004 are alternatives. CAM-005 starts overdue. CAM-006 starts in maintenance. Reservations never clear physical custody.

## Assets

All runtime images and font files are bundled locally. See `public/brand/ASSETS.md` and `public/demo-media/ASSETS.md` for provenance. The mixed wedding stock collection is illustrative; it is not claimed to be Timbrel's client work. There is no live image hotlink, protected portfolio scrape, or runtime font service. Image source pages carry photographer attribution; no unverified photographer names are invented. Downloading a customer collection produces a labeled manifest, not stock originals or a fictional bulk ZIP.

`scripts/prepare-assets.mjs` is an optional maintenance script for downloading and resizing the source stock. Normal setup and runtime do not execute it.

## Reset

Settings → Reset demo data → Reset demo restores the exact seed, identities, selections, audit and notification state. The page reload clears modal state and temporary previews. Reset only affects this browser origin.

## Boundaries and production backlog

- No backend, account login, real RBAC, provider connection, messaging, payment processing, cloud uploads, external signatures, automated backups or public deployment.
- Record scoping is an interaction simulation. All synthetic records exist in browser storage and bundled media is public static content; production privacy cannot be provided by client-side selectors.
- Browser-local state is shared across role changes and refreshes in the same origin. Separate devices and independent tabs are not a synchronized multi-user system.
- Uploads use sample metadata and optional temporary local previews. Upload progress, retries, expiry and retention are demonstrations; no real large-file transfer, quota service, transcoding, archive deletion or storage billing occurs.
- The gallery is optional for production. Keep the current Pixieset website; manually entered external gallery links and physical deliveries remain supported.
- Production requires server record authorization, transactional reservation/custody/ledger constraints, private object storage and signed access, integration permissions/retries, consent, agreed retention, restore testing, audit controls and validated tax/accounting workflows.
- The catalogue, sample calendar range and fixed seed scenarios support a sales presentation, not a complete production configuration or statutory accounting product. No automated damage deductions are implemented.

See `DEMO_SCRIPT.md`, `DESIGN_SYSTEM.md` and `VALIDATION.md` for the walkthrough, visual conventions and recorded verification results.
