# Validation record

Verified locally on **24 November 2026**, using Node 22.23.2, npm 11.6.2, Next.js 16.4.6, and installed Google Chrome on Windows. No deployment or external business-service connection was performed.

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed, no TypeScript errors. Production builds also run the TypeScript check. |
| `npm.cmd run lint` | Passed, no warnings or errors. |
| `npm.cmd test` | **26 passed**: 24 domain tests and 2 rendered form/ledger tests. |
| `npm.cmd run build` | Passed; optimized output is `.next-production/`, separate from the active development cache. |
| Production `npm.cmd run test:e2e` | **14 passed**, 44.7 seconds in the final run. |
| Production `node scripts/visual-check.mjs` | **25 routes returned 200**, no browser JavaScript/console errors, no page-level horizontal overflow. |
| Semantic text contrast | **12/12 token pairs passed 4.5:1**, minimum measured ratio **5.45:1**. |
| Screenshots | 10 captures, including all five target viewport sizes and all five required representative screens. |

Production browser checks ran against an isolated local server at port 3100 using `TIMBREL_TEST_URL`. The original development preview on port 3000 was preserved. The temporary production verification server is stopped after QA.

## Browser journeys

1. Create enquiry, log follow-up, edit/discount quote, send/accept, convert once to a held booking, enforce verified advance, confirm and refresh.
2. Explain deliberate crew/gear conflicts, then accept valid alternatives.
3. Reserve/issue current-day gear, acknowledge/request return as the freelancer, inspect a damaged return as owner, and preserve another outstanding item. The With crew count includes overdue custody.
4. Accept a freelancer assignment, verify owner readiness, and avoid displaying other crew rates.
5. Request production changes, review/approve parallel tasks, record media handover, and release/deliver the linked output.
6. Favorite photographs, navigate lightbox by keyboard/Escape, submit exactly six stable IDs, persist after refresh, and reopen as owner.
7. Record ₹25,000, verify ₹75,000 due, reverse with reason, and record partial crew payout.
8. Receive a campaign lead idempotently and recalculate manual spend.
9. Fail/retry simulated upload, block premature publication, publish successfully, enforce wrong-customer access and expiry.
10. Map/preview CSV input, report invalid rows, and export actual filtered reports.
11. Navigate global search, filter to an empty result, collapse desktop navigation, resize to mobile, use the drawer, and reset to the exact seed.
12. Recover corrupt browser data and keep in-memory interactions working when browser storage is unavailable/full.
13. Record a bounded refund and accept a linked quote revision without duplicate bookings or overwriting original commercial values.
14. Keep draft quote revisions out of the customer document list and reject their direct print URLs for the customer role.

Unit checks additionally cover half-open time intervals and buffers, zero-denominator margin, tax/optional-item arithmetic, immutable action inputs, missing equipment, atomic reschedule failure, cancellation retaining custody, payout approval boundaries, duplicate references, India-time interpretation independent of host timezone, persistence shape recovery, selection limits and payment-lock eligibility.

## Visual evidence

`artifacts/visual-report.json` contains route, overflow and contrast results. `artifacts/screenshots/` contains:

- `dashboard-desktop.png` — 1440×900 viewport.
- `dashboard-1280.png` — 1280×800 viewport.
- `dashboard-1024.png` — 1024×768 viewport.
- `dashboard-tablet.png` — 768×1024 viewport.
- `dashboard-mobile.png` — 390×844 viewport.
- `event-desktop.png`, `equipment-desktop.png`, `gallery-desktop.png`.
- `freelancer-mobile.png`, `gallery-mobile.png`.

Captures are full-page screenshots, so image height can exceed the viewport height. `artifacts/stock-contact-sheet.png` supports inspection of all twelve distinct sample photographs. Representative owner, inventory, event, freelancer and gallery screenshots were visually reviewed. Operational tables intentionally scroll inside their wrappers.

## Verification limits

Chrome was tested; native Safari/iOS/Android and a full NVDA/VoiceOver walkthrough were not run. Token contrast checks and keyboard/dialog tests are not a full WCAG certification. This is a browser-local synthetic prototype: production authorization, database concurrency, real payment reconciliation, integration permissions, signed private-object delivery, upload recovery/quota, backup restore and retention deletion require backend implementation and separate validation.
