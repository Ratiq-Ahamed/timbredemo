# MASTER IMPLEMENTATION PROMPT — TIMBREL STUDIO OS
Copy this entire document into your coding agent, together with `01_BRD_Timbrel_Studio_OS.md`, `02_Product_Description.md` and the approved logo asset. The BRD is the source of business requirements; this prompt governs the sales demo and its design. Build a working product prototype, not a landing page, screenshot, or presentation.

---

## 1. Role, outcome and execution rules
Act as a senior product designer, design systems architect, frontend architect, UX researcher and QA engineer. Build a coherent high-fidelity, fully navigable, interactive front-end prototype for **Timbrel Studio OS**, a bespoke photography business management ERP by Myurrix. This will be presented live to the studio owner. Demonstrate a believable end-to-end business workflow; prioritize the owner's reported pain points (Meta ads, manual management, freelance crew, expensive equipment custody, pen drive delivery).

Inspect the repository, package manager, existing routes, components, installed dependencies and assets first. Reuse good conventions; do not rewrite unrelated features or add libraries unnecessarily. Produce a brief internal plan, then implement the complete demo. Do not stop at a plan or ask for routine design choices. Do not declare completion until the build and interaction checks pass. If something cannot be verified, disclose it in README. No backend, real integrations, payment, OTP, email, WhatsApp sending, storage account, or production authentication needed. Simulate them explicitly. No private keys or external service secrets. Never claim that a simulated action is live. Do not create a real production environment.

## 2. Client and brand assets (mandatory)
Official website: https://timbrelstudio.mypixieset.com/ ; contact: https://timbrelstudio.mypixieset.com/contact/ . The website is on Pixieset; it describes wedding/film/album and baby photography across Tamil Nadu. Preserve website, do not rebuild or mimic the marketing site as the admin app. Service areas are not verified branch stockrooms.

1. Inspect `public/brand/` and supplied assets first. Preferred `public/brand/timbrel-logo.svg`, alternative `timbrel-logo.png` with transparency. If no asset supplied and environment has internet access, inspect official website header image/inline SVG and actual rendered branding. Verify it really is the logo (not hero, photo watermark, favicon, or social image). Only use a client-approved asset for external demo; if extracted, save local copy and source/license/approval status in `public/brand/ASSETS.md`. Do not trace a random logo, create a new symbol, add a camera icon pretending to be their mark, stretch it, recolor arbitrary artwork or hotlink unreliable images. If unavailable, use plain text `Timbrel Studio` with a neutral typographic treatment; flag `official logo pending` in developer README and handover, not repeatedly across the UI. Build a `BrandMark` component with correct aspect ratio and fallback; one file replacement must update login, shell, quote, mobile and gallery. Use an approved light/dark variant or a neutral background if needed. Keep brand clear space. Do not call proposed tokens official colors.
2. Use locally bundled licensed stock photography or client-approved demo media only. Prioritize South Indian wedding editorial imagery, believable gear thumbnails and no actual customer/child photos without permission. Record provenance in `ASSETS.md`. Do not silently scrape protected galleries, use copyrighted portfolio photos as if authorized, or request live client photos. If imagery unavailable, use intentionally styled local abstract photo placeholders with file-name labels, and disclose the gap. Use a small set of high-quality images (not duplicated hero in every row), stable filenames, optimized AVIF/WebP thumbnails, responsive sizes, and native lazy loading. Include at least 12 distinct authorized gallery assets or intentional placeholders for a functional selection flow. No broken remote images. No image of real customer required.
3. Product name `Timbrel Studio OS`; owner shell brand is Timbrel Studio, with understated `Powered by Myurrix` in settings/footer. Demo data badge in app-level switcher and integrations; no exaggerated marketing claims.

## 3. Non-negotiable design direction
**Editorial warmth + operational precision.** Premium creative studio meets a mature operations console. Treat as three intentional applications sharing one system, not a generic admin template with different colors. Desktop owner console is information-dense and structured; freelancer interface is thumb-friendly; client gallery is cinematic and minimal. A premium interface is hierarchy, consistency, alignment, typography, contrast, responsive behavior and usable details—not gradients, shadows and excessive decoration.

### 3.1 Semantic design tokens (proposed, refine for approved logo)
Create central tokens in `globals.css` / design token module and expose via Tailwind theme or equivalent. No random component-local hex except chart palette/token declaration. Support light operational theme and dark navigation; no obligatory dark-mode toggle unless actually implemented. Use gallery theme separately.

| Token | Value | Usage |
|---|---|---|
| canvas | #F5F4F0 | Admin app background |
| surface | #FFFFFF | Tables, drawers and panels |
| surface-muted | #EEEBE5 | Secondary fills |
| ink | #242521 | Primary copy |
| ink-secondary | #555A52 | Secondary copy |
| ink-muted | #666B64 | Metadata; verify AA |
| border | #E1DED6 | Hairline borders |
| sidebar | #202521 | Dark graphite-olive |
| sidebar-active | #394139 | Active row |
| sidebar-ink | #F5F2EB | Active/main nav |
| sidebar-muted | #B9C0B7 | Secondary nav |
| primary | #344C40 | Deep forest action |
| primary-hover | #283D32 | Hover |
| primary-foreground | #FFFFFF | Action text |
| accent | #A47B46 | Muted brass detail; not tiny text on white |
| accent-ink | #795329 | Accessible dark brass copy |
| gallery-bg | #F7F3EA | Editorial ivory |
| success-bg / ink | #E8F2EA / #276141 | Successful states |
| warning-bg / ink | #FFF0D7 / #85510B | Pending/attention |
| danger-bg / ink | #FBE9E6 / #A33832 | Critical/blocked |
| info-bg / ink | #E6EEF7 / #345C86 | Information/reserved |
| neutral-bg / ink | #EDEDE9 / #4F5650 | Neutral statuses |
| focus | #497B69 | Visible focus ring |

Validate contrast (WCAG AA target: 4.5:1 normal text, 3:1 large text and essential nontext controls); never communicate status via color alone. Use semantic labels/icon/text. Charts use muted forest, blue-gray, brass, slate, rose; legends and tooltips; no rainbow palette. Money and numeric columns use tabular figures.

### 3.2 Typography and scale
Use locally bundled or existing properly licensed font: Inter (or Geist) for all operational UI, Cormorant Garamond or Playfair Display for occasional gallery headline only. System fallback always available; no remote font dependency at demo runtime. Do not use serif for dense tables or every heading. Suggested typography: desktop page title 28/36 weight 600, section 18/26 600, card 15/22 600, body 14/22 400, table 13/20, metadata 12/18; mobile page title 24/32. Gallery title 48–64 with responsive clamp, body 15/24. Avoid 10px gray unreadable copy, excessive all caps, huge empty headers.

### 3.3 Spacing, geometry and elevation
4px base; use 4/8/12/16/20/24/32/40/48. Page padding 32 desktop, 24 medium, 16 mobile. Standard section gap 24. Cards radius 10–12; controls 8; drawers 12 at exposed edges; status badges modest 4–6 or compact pill. One-pixel hairlines, shadow only for floating popover/dialog/dropdown, no giant floating cards. Buttons 36–40 desktop, min 44px touch targets mobile, primary/secondary/ghost/destructive variants. Inputs consistent 40px; labels above. Dense table row 48–52, comfortable 56–60; sticky header, aligned numbers, hover and focus, optional selection. Avoid nested cards and unnecessary borders around every subheading. No random giant rounding, neon, glassmorphism, gradients, blurred blobs, stock dashboard template, oversized icon backgrounds, emoji icons, decorative charts, repetitive equal-width card soup, excessive animations or black backgrounds with illegible gold text.

### 3.4 Layout systems
- Owner desktop at 1440×900: 248px sidebar (collapsible 72), 64px topbar, main grid 12 columns with 24px gutters. Main max width 1600 only on large monitors; tables stretch. Left navigation grouped, real active route, group headings, 20px Lucide outline icon, consistent hover. Topbar breadcrumb/title, global search, date/location filter where relevant, notifications and role switch. Keep page primary action visible without scrolling. At 1280 maintain table space; at 768–1023 sidebar becomes overlay/collapsed, at 390 responsive stack. No page-level horizontal overflow; tables may scroll inside wrapper.
- Owner page anatomy: breadcrumb, title + one-line context, action(s), filters, then KPI/records only as needed. Dashboard use asymmetric 8/4 grid with action queue and calendar; not every screen is KPI grid.
- Detail pages: context header with identity, status, key metadata, primary action; tabs or anchored sections; main 8/4 with secondary panel. Preserve back/filter context. Drawers for quick edits; dedicated route for complex multi-step forms.
- Freelancer: max 600px centered on desktop, mobile bottom nav Home/Jobs/Gear/Payouts; safe-area padding; actionable assignment cards, high contrast, no admin tables. Show date/time, venue, role and payout on own job only.
- Customer: full-bleed editorial hero, elegant serif headline, restrained topbar, image-first grid with 2 mobile/3–4 desktop columns or controlled masonry with stable aspect ratios. Favorites, selection counter and submit action sticky when selecting; lightbox with keyboard arrows/Escape and accessible controls. Separate customer tracking from gallery view. No admin chrome.
- Motion: 120–200ms opacity/transform, honor reduced motion. No fake loading delays that interrupt demo. Skeletons match real content shape; no layout shift. Toasts concise and undo only if actually supported.

## 4. Architecture for the demo
Use Next.js App Router + TypeScript strict + Tailwind CSS (adapt existing versions, do not force upgrade) + Lucide icons. Radix/shadcn primitives permitted if already available or valuable, but fully restyle with tokens; don't ship default component aesthetic. Recharts or existing chart lib for only meaningful charts. Use local date helpers and Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0}); dates readable Indian locale, timezone Asia/Kolkata; choose a fixed demo clock (24 Nov 2026 10:00 IST) to ensure deterministic overdue statuses. No dates that drift between refreshes.

Suggested structure:
```
app/(demo)/admin/...
app/(demo)/freelancer/...
app/(demo)/client/...
app/page.tsx
components/ui/             # primitives
components/shell/          # BrandMark, nav, topbar
components/domain/         # stage badge, asset picker, quote builder etc.
features/{crm,bookings,gear,crew,production,galleries,finance}/
lib/demo/{types,seed,selectors,actions,store,validation}.ts
public/brand/ public/demo-media/
```
One typed normalized domain store (Zustand or context+reducer, choose one) with versioned localStorage persistence, SSR-safe hydration, seed reset, deterministic IDs, derived selectors. Do not use independent page-local arrays for shared business records. Relationships via IDs: lead → quote → booking → sessions → assignments/reservations/issues → tasks/deliverables/gallery/finance. Compute KPIs from store; do not hardcode contradictory totals. Monetary amounts use integer rupees for whole-rupee synthetic demo or integer paise when discounts/tax require precision; consistent calculations. Dates and status transitions validated. Mock operations return success/error outcomes; no backend network. Any CSV export generated locally; quote uses print-friendly route or actual downloadable file if implemented; download sample file only if bundled. File-upload UI uses local object URLs for sample previews (revoke after use; do not store large blobs in localStorage). Simulated high-volume files use metadata, not actual 50GB upload. Add reset dialog and explicit demo role switch.

## 5. Route and navigation blueprint
Use grouped navigation with 13 top-level entries maximum; secondary pages use tabs, not 30 permanent sidebar items. All routes must resolve and be navigable. Hide unsimulated future actions or explain with disabled + reason. No dead links, empty stub pages or buttons that only toast success without changing state.

| Route | Page purpose / required sections |
|---|---|
| `/` | Branded entry, enter owner workspace, freelancer workspace, customer experience; demo disclosure |
| `/admin` | Command center; KPIs, collections/expenses chart, upcoming sessions, readiness and exceptions, marketing snapshot |
| `/admin/leads` | CRM board + list toggle; source/stage/date/owner filters; new lead, search, activity drawer, follow-up, loss reason, quote action |
| `/admin/marketing` | Campaign metrics, source funnel, attributed vs unattributed, manual spend editing, simulated Meta status/receive test lead, import fallback |
| `/admin/quotes` | Quote list/version status and package catalogue tab; create/edit quote, printable preview, send simulation, accept/decline and convert |
| `/admin/customers` | Customer records and repeat bookings; contact/activity, notes, related projects; no real PII |
| `/admin/calendar` | Month/week/list, upcoming session and reservation drilldown, today/demo date, location/crew filters |
| `/admin/events` | Booking list with readiness, due date, contract, collection status; create/filter; links to detail |
| `/admin/events/[id]` | Overview, sessions, team, gear, production, deliverables, finance and history tabs; actions mutate common store |
| `/admin/crew` | Directory, skills, availability, role/rate, assignment schedule and payout summary; detail drawer |
| `/admin/equipment` | Inventory, reservations, issue/return, maintenance and audit tabs; search/status/location; QR label print preview |
| `/admin/equipment/[id]` | Asset profile, serial, condition, current custodian, upcoming reservation, service and movement log |
| `/admin/production` | Board/list, task type/assignee/due filters, parallel tasks, revisions, media handover and delivery tabs |
| `/admin/galleries` | Draft/published/expired, collection editor, media selection, link settings, simulated upload/retry, publish/revoke |
| `/admin/galleries/[id]` | Manage gallery, sections/cover, access/expiry, client favorites/selection, copy demo URL, preview |
| `/admin/finance` | Collections, payouts, expenses, event contribution tabs; record transactions, approval, partial payment, reversal, export |
| `/admin/reports` | Date/location/service filters; marketing, delivery, custody, contribution; CSV export |
| `/admin/settings` | Demo role/config, service/location catalogue, brand preview, integration statuses, retention simulation, reset |
| `/freelancer` | Own upcoming job, action list, gear in custody and outstanding payout |
| `/freelancer/jobs` | Own assignment list/detail, accept/decline, call time, venue, role, handover/expense action |
| `/freelancer/gear` | Own issued gear, condition, acknowledgement and return request; manager verifies actual return |
| `/freelancer/payouts` | Own agreed rates, settlements and history |
| `/client` | Own project milestones, documents, payments and gallery access |
| `/client/gallery/[id]` | Editorial gallery, sections, lightbox, favorites, album selection, download sample, expiry states |

Owner nav group Overview (Dashboard, Calendar); Sales (Leads, Marketing, Quotes, Customers); Operations (Events, Crew, Equipment, Production); Delivery (Galleries); Finance (Finance, Reports); Settings footer. Secondary screens accessible through context. Mobile owner navigation available in drawer. Provide route-not-found state and back navigation.

## 6. Screen-level composition and visual details
### 6.1 Dashboard (first impression)
At 1440 desktop header title `Studio overview`, small subline `Here’s what needs your attention today.`, primary `New booking`, secondary date/location controls. Four KPI strip (collections in selected period, confirmed booking value, outstanding customer balance, open crew payouts); numeric values with clear period and deltas only if computed. One 8-column chart collections vs paid direct costs by week/month with legend, axes and tooltip; right 4-column `Needs attention` grouped actionable rows with count and time. Next row 8-column upcoming sessions table (date, booking, location, team readiness, gear readiness), 4-column equipment custody summary and marketing snapshot. Lower optional delivery due list. Avoid enormous welcome hero and arbitrary charts. Action queue links to actual filtered pages; clicking a KPI opens records. Dashboard selector must handle zero results gracefully.

### 6.2 Leads + marketing
Lead board columns New, Contacted, Qualified, Quoted, Negotiation, Won/Lost filter. Compact cards with name, service, event date, estimated budget, source and follow-up due. Drag-and-drop optional; accessible stage dropdown mandatory. Detail drawer activity history, owner, next step, quote CTA. Search and filters work in both views. Marketing page calm, data-first: spend, attributed leads, confirmed bookings, booked value, CPL/cost per booking; campaign table and source comparison. Clearly `Simulated Meta data` and status; `Receive sample lead` creates one lead with campaign ID and affects appropriate selectors. `Connect Meta` opens explanation (no OAuth); `Import CSV` can parse valid small local data or offer sample template; don't pretend personal WhatsApp history is accessible. Spend editing recalculates ratios. Unattributed/manual sources visible, canceled bookings excluded from confirmed count.

### 6.3 Quote, event and calendar
Quote builder with customer header, catalogue picker, quantity/rate, optional items, discount, subtotal/total, payment milestone and notes. Live summary sticky, tax toggle default off/sample before tax. Validate values. Quote preview letter-like branded print layout; print CSS hides shell. Quote acceptance simulation then single `Confirm booking`; duplicate conversion blocked. Calendar sessions (not just orders) with event type color legend, multi-day wedding, detail popover and list fallback. Event detail uses compact header, readiness progress by session not fabricated percentage; tabs as route query or internal state. Show schedule, role requirements, assignment picker, equipment selection, timeline and finance. Reschedule opens conflict preview and confirms only if allowed. Booking cancellation preserves financial and custody records. Real names in sample are fictional.

### 6.4 Gear — hero differentiator
Inventory table with small asset thumbnail/category icon, ID/model, location, condition, custody, next reservation, due back, row menu. Filters Available / Issued / Overdue / Maintenance / Reserved (future reservations distinct from physical custody). Asset detail includes purchase metadata, condition, current holder, linked booking, chronological movements and maintenance. `Reserve` opens date/session asset picker, shows overlap reason. `Issue gear` drawer: choose session + named custodian + select/scan QR; show valid list, condition notes, due back, confirmation summary. Demo scan: manual code input and `Simulate scan CAM-001`, clearly labeled; optionally actual camera QR via supported browser and permission, not needed. Invalid code error; already-issued asset cannot be issued. Generate printable actual QR from opaque asset ID if library available; never QR with customer data. Return drawer lists issue lines with good/damaged/missing, condition note, partial return. A damaged asset becomes inspection/quarantine and remains unavailable; outstanding gear stays open. Show movement and overdue alert updated across admin and freelancer. Maintenance note/release action only authorized in simulation. No automatic damage deduction.

### 6.5 Crew — second differentiator
Directory table, skill chips, location, availability indicator based on time filters, rate, assignment count. Detail drawer shows schedule, notes, payout history. Assignment form on event checks time overlap and required skill; select alternative person; agreed rate snapshot. Freelancer portal accepts/declines and updates event readiness; own gear acknowledgement and return request; owner completes physical inspection. Payout card with approved/paid/remaining, no unrelated crew information. Mobile bottom nav, call time, address, directions as text (no fake navigation), contact display synthetic, accessible action buttons. Keep forms small and clear.

### 6.6 Production, media, delivery
Board/list with parallel task types (photo culling/editing, video edit, reels, album, QC), responsible person, due date, blocked reason, progress based on task counts. Task drawer shows version, review/comments and state transitions; changes requested returns to work. Handover log form with source card/drive reference, size/count, received by, storage label, backup confirmation; never label unconfirmed backup verified. Deliverable records distinguish printed album, final JPEG collection, film, reels, pen drive. `Mark dispatched` with courier/pickup, reference, cost; `Confirm delivered` records acknowledgement. Customer-facing milestones derived from published events only, no internal notes or freelancer payouts. Gallery editor with cover, collections, photo count, upload queue with simulated progress, error/retry, publish, expiry, revoke, preview; local sample media only. External gallery URL fallback supported and labeled.

### 6.7 Gallery and customer — emotional differentiator
Use editorial composition, imagery, subtle brass accent, serif event name. A fictional completed project `Kavin & Meera` (November wedding) is ready to demo immediately. Hero wide landscape, text below or contrast-safe overlay, event date, gallery controls. Grid section filters Wedding / Reception / Portraits; stable IDs, favorite and select controls separate if needed; lightbox keyboard and swipe if feasible; selection count, max target, submit confirmation, owner sees exact selected IDs. Reopen selection via admin; customer gets read-only submitted state until reopen. Original download button serves small bundled permitted demo file or sample manifest, clearly labeled; not pretend to download full collection. Access expiry/revoked/payment lock simulated and enforced in mock selectors, show clear states. Provide `request pen drive` or physical delivery tracking if configured, with no actual purchase. Client portal quote/payment/progress and approval actions. No public media directory beyond bundled synthetic demo assets; production authorization described in BRD.

### 6.8 Finance — closing differentiator
Tabs: collections ledger, crew payouts, expenses, event contribution. Contract amount, received, balance, due; verify part payment; refund/reversal with reason and ledger entry, no deletion. Crew agreed rate/expense/payout separated; prevent overpayment or require explicit adjustment. Planned vs actual cost basis explicitly labeled; no mixing taxes or cash receipt with contract value. Contribution detail with cost categories, revenue, cost, margin (zero-denominator N/A), export. Use consistent accessible chart/table instead of fake analytics. Reports derive from same store, filters change data.

### 6.9 Settings, reports and global interactions
Global search searches lead/customer/event/asset/crew, click routes correctly; keyboard shortcut optional. Notifications show actual due records, mark read works, click navigates. Filters support clear all, no results and search empty. Reports export actual filtered CSV. Settings change demo location options/retention if enabled; no real external integrations. Reset restores exact seed after confirmation. Integration tiles show `Not connected — demo` and simulate receive/test only. Avoid meaningless Save buttons. Include accessible modal focus trap, Escape, restore focus and validation; toast state not sole confirmation.

## 7. Seed dataset and calculation consistency
Use deterministic seed clock 24 Nov 2026. Seed 12+ leads, 4 campaigns, 8 bookings across past and future, 12+ sessions, 12 crew, 24+ serialised gear items, 3 kits, 4+ issue transactions, 15+ production tasks, 2 galleries, 10+ money records. Realistic but all fictional; use example.test email and masked/fictional phone placeholders, no live numbers or real customers. Service types Wedding, Pre-wedding, Baby shower, Baby photography, Engagement, Corporate (latter illustrative). Service areas Chennai, Coimbatore, Tirunelveli; locations/stockrooms marked sample. Keep one demo focus booking and one completed gallery separate so future shoot is not shown as already delivered.

**Anchor booking** `EVT-0124 — Rahul & Priya Wedding`, Chennai, contract ₹1,50,000 excluding tax, ₹50,000 verified advance, ₹1,00,000 due. 2 Dec pre-wedding; 5 Dec sangeet; 6 Dec wedding; 7 Dec reception; each real start/end with crew role counts and reservation windows. Planned direct costs ₹82,500: crew ₹40,000, editing ₹15,000, printing ₹12,000, travel ₹6,000, rental ₹4,000, advertising allocation ₹2,500, other ₹3,000. Planned contribution ₹67,500, margin 45%. Do not pretend these are actual costs or collected revenue. Existing customer records/campaign linkage support calculations.

**Conflict demo:** CAM-002 has confirmed overlapping reservation for another Dec 6 session; choose alternate CAM-001 if free. Freelancer F-003 already assigned overlapping time; alternate F-004 available. Implement date range overlap and separate physical custody check. Store buffers (e.g. 30 min) and explain when conflict applies. Seed overdue issued CAM-005 and good returned asset; one maintenance item. Reserve anchor gear before issue; for live demo issuing future event gear allow documented pickup date today only if policy allows and no conflicting earlier reservations; alternatively use a separate current-day shoot for custody demo, clearly identify context. Do not create time travel inconsistencies.

**Completed gallery** `EVT-0118 — Kavin & Meera Wedding`, 15 Nov, published 21 Nov, expiry 21 Dec, 12+ sample photos grouped, selection target 6, customer paid/release eligible. Demo expiry toggle and restore through reset. Production tasks for another recent event, parallel photo/video branches and pending album approval. Historic sample records support charts, not fabricated independent chart arrays.

## 8. Required demo behaviors and state contracts
Implement pure action functions and validation before wiring. All changes persist in same local store across role/route changes and refresh. Required flows:
- add lead → log follow-up → create quote from lead → change price/discount → accept → convert to booking once;
- select existing anchor event → inspect sessions → attempt overlapping crew/gear assignment → show explanatory error → select valid alternative → confirm;
- reserve/issue gear to freelancer → acknowledge in freelancer portal → partial return/damage in owner portal → update custody, condition, movements and dashboard;
- decline/accept assignment in freelancer view → owner staffing status updates; record media handover for completed shoot;
- move task to review → request changes → approve → mark associated deliverable ready → release/deliver with optional physical tracking;
- publish draft gallery or open existing one → client favorites and select six IDs → submit → owner sees selections → reopen if desired;
- record ₹25,000 part collection for anchor → due ₹75,000 → dashboard and event ledger update; reverse transaction with reason → due ₹1,00,000; record partial payout for a selected crew member;
- simulate one Meta lead with campaign → CRM and campaign count update; replay same external ID does not duplicate;
- reset returns all state to initial scenario, clears transient UI and notifications appropriately.

Use status dictionary in one module, real select components, scoped selectors. Role-switch simulation must expose only selected role's records; clarify it is not production security. Use `localStorage` version/migration or reset, guard SSR and hydration. No real file transfer, biometric matching, real signature, billing, account connection, payment, WhatsApp or external submission. In UI mark simulated integrations and sample download. No mock login asking for real credentials.

## 9. Engineering quality and anti-vibe-coding checklist
- Define reusable primitives: Button, IconButton, Input, Select, DateField, SearchField, FilterBar, DataTable, Tabs, StatusBadge, Metric, EmptyState, Skeleton, Dialog, Drawer, Toast, Breadcrumb, PageHeader, Money, Timeline, Avatar, BrandMark, GalleryImage, AccessibleLightbox. Domain components: EventReadiness, AssignmentPicker, AssetPicker, CustodyTimeline, QuoteSummary, SelectionBar, PaymentLedger. Share style tokens and variants; no monolithic 2,000-line page or copy-pasted component variants.
- Keep business rules in selectors/actions, not inline JSX. Derived totals from source data, stable keys, exact arithmetic. No repeated array scans in large render loops where simple maps suffice; no full media blobs in state; lazy route chunks where appropriate. No useless useEffect polling, expensive animation or global re-render for every field.
- All visible controls work or are deliberately disabled with reason. No dead menu entries, fake counts, nonfunctional form buttons, toast-only mutation, placeholder “coming soon” for core flow, random lorem ipsum, broken links, duplicate asset IDs, inaccurate event dates or stock photos passed off as actual client work.
- Accessibility: WCAG AA contrast target, keyboard nav, focus visibility/trap, labels and aria for icon-only buttons, table headers, accessible drag alternative, reduced motion, mobile touch target, no color-only statuses.
- Responsive verify 1440×900, 1280×800, 1024×768, 768×1024, 390×844. Review screenshots of dashboard, event detail, inventory, gallery, freelancer mobile. Correct overflowing tables, clipped tooltips, truncation, sidebar behavior, gallery CLS and inconsistent spacing. Use browser screenshot tooling if available; disclose if not.
- Test pure selectors (quote, balance, margin, crew overlap, asset overlap/issue/return, dedup, selections); test key components; run typecheck, lint and production build. If Playwright/Cypress available, automate demo journeys and refresh persistence. No new dependencies just to inflate test count. Report commands, pass/fail, limitations, and screenshots if generated. Never claim tests ran if they didn't.
- Add README with setup commands, routes, feature map, demo script, sample login-free roles, reset, data/model explanation, assets provenance and missing approvals, known limitations, production backlog. Include `DESIGN_SYSTEM.md` with actual tokens, component variants, layout, accessibility and asset policy. Include `DEMO_SCRIPT.md` with walkthrough. Don't expose private actual credentials. Do not deploy publicly without user authorization.

## 10. Live presentation script (10–12 minutes)
0:00–0:45 Owner dashboard: “What is happening today? What is overdue?” Show action queue, not every metric.
0:45–2:15 Marketing & CRM: simulate lead from campaign; open lead, follow-up, quote; explain actual integration requires access. Show linked booking or convert a sample lead; avoid consuming too much time filling fields.
2:15–4:00 Event planning: open Rahul & Priya, multi-session wedding, roles and gear readiness; attempt a conflicting crew/asset, show alternative.
4:00–6:00 Equipment: open asset profile, show QR/manual simulated scan, issue to named freelancer for a valid session, mobile acknowledgement, partial/damaged return. Show live changes to custody and exception queue.
6:00–7:00 Freelancer: mobile role switch, accept assignment and view own rate and gear; owner sees update.
7:00–8:00 Production: open a recent completed shoot, track independent photo/video and album tasks, review and handover.
8:00–10:00 Customer: open Kavin & Meera editorial gallery, select six sample photos, submit, switch owner and verify list. Explain optional digital delivery/pen drive and existing Pixieset fallback.
10:00–11:00 Finance: show ₹1.5L contract and ₹67,500 planned contribution, record ₹25k part payment and watch balance update. Distinguish contribution from profit.
11:00–12:00 Ask owner which pain is highest; confirm current Pixieset usage, ad type, gear count, freelancer count and actual media GB/retention; discuss phases and price after scope. Never promise live integration from mock.

## 11. Definition of done
1. Working frontend in repo, all required routes navigable, no blank core screens; connected synthetic data and persistence.
2. Owner, freelancer and customer experiences have distinct purposeful layouts and shared design language.
3. Authentic approved logo used if supplied; otherwise typographic fallback documented, one replacement location; no invented official branding.
4. All nine workflow actions in section 8 work; clear validation, errors and reset; no unsafe real external side effects.
5. Premium typography, alignment, color semantics, responsive behavior and accessible controls verified at target viewports.
6. README, DESIGN_SYSTEM.md and DEMO_SCRIPT.md complete; asset provenance and integration/storage production boundaries documented.
7. Typecheck/lint/build attempted and results reported accurately; critical failures fixed or disclosed. Provide concise implementation summary and list remaining blockers, including logo approval and actual production discovery.

**Final instruction:** Build the actual interactive demo now. Do not return only design suggestions, generic dashboard scaffolding, screenshots, an image, or an implementation plan. Review the final application like a senior product designer and engineering lead before calling it finished. Prioritize coherence and reliable workflow over flashy features.
