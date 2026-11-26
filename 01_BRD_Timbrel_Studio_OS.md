# Timbrel Studio OS
## Business Requirements Document (BRD)
**Prepared by:** Myurrix | **Version:** 0.9 — discovery and demo baseline | **Date:** 24 November 2026

> Status: Proposed, not approved. This document describes the target product and a separately scoped sales prototype. Sample records, financial values, deadlines, locations of assets, roles and volumes are illustrative, not client-confirmed. Do not use this as a fixed-price statement of work until discovery and scope acceptance are complete.

## 1. Executive summary
Timbrel Studio needs a single operating workspace connecting enquiry acquisition, quotation, booking, multi-session event planning, freelance crew, physical equipment custody, production and digital/physical delivery, customer collections, vendor costs and event contribution. Today, according to the sales team's discovery, these workflows are largely manual; the owner personally runs Meta ads, assigns freelancers and studio-owned equipment to jobs, pays agreed amounts, and supplies media using purchased pen drives. The public portfolio describes an artistic/candid photography team working in Chennai, Coimbatore and Tirunelveli, with wedding, baby shower and baby photography and wedding films/albums. These are service areas, not proof of separate offices or stockrooms.

The solution should answer four questions at any time: What work is due? Who is doing it? Where is each asset and media handover? How much have we earned and what remains payable/receivable? The product complements the current Pixieset website; replace gallery or CRM features only where discovery establishes value. Avoid duplicate data entry and duplicate subscriptions.

## 2. Business context and evidence
| Fact / hypothesis | Source / confidence | Implication |
|---|---|---|
| Owner runs Meta ads | Sales discovery; client confirmation pending | Track enquiries and outcomes; determine whether ads use Instant Forms, WhatsApp, or website leads |
| Freelancers receive owned equipment and agreed compensation | Sales discovery | Job-level assignments, physical custody, return verification and payout ledger are core |
| Final media is delivered by pen drive | Sales discovery | Offer secure digital delivery; retain physical option and master archive |
| Weddings, baby shower, baby photography; service areas Chennai, Coimbatore, Tirunelveli | Public website [S1–S2] | Support multiple sessions and location fields; don't assume three branches |
| Existing Pixieset website and contact form | Public website [S1–S2] | Confirm plan and current workflows before integration or replacement |
| Large inventory, data size, monthly event volume | Reported qualitatively; quantities unknown | Measure real limits, asset taxonomy, storage, seats and costs before contract |

### 2.1 Competitive and build-versus-buy assessment
Pixieset Studio Manager already advertises CRM, bookings, projects and client documents; its Client Gallery supports proofing, sharing and downloads [S3–S5]. Indian studio products such as ShootBook and DODO advertise crew/gear workflows too [S6–S7]. Myurrix must not claim uniqueness or that off-the-shelf tools cannot solve these problems without testing. Demonstrate client-specific custody controls, event/session-level planning, freelancer settlement, delivery coordination and attribution-to-booking reporting together; then compare total cost, migration burden, usability, support and exact feature fit. Keep the current website; support a manually entered external Pixieset gallery link in V1 as a fallback. No assumed Pixieset API availability.

## 3. Objectives and measurement
| Objective | Proposed measure | Baseline / target method |
|---|---|---|
| Reduce missed enquiries | % enquiries with owner and next action; median first response | Baseline over 2–4 weeks; propose 95% assigned and tracked |
| Reduce booking conflicts | Confirmed overlapping resource reservations | Target zero unapproved conflicts |
| Protect equipment | % issued serialised assets with recorded custodian; overdue returns | Target 100% of tracked handovers recorded |
| Improve freelancer coordination | Assignment acceptance time; unfilled sessions | Measure baseline; monitor day-before gaps |
| Reduce delivery delays | % deliverables on/before contractual due date | Target agreed after baseline |
| Improve financial visibility | % closed projects with itemized costs; overdue collections | Target 100% closed projects cost-reviewed |
| Reduce routine pen drive expense | Digital delivery adoption; physical units and actual cost avoided | Compare like-for-like event types; no guaranteed savings |
| Improve retention | Reviews/referrals/repeat bookings from opted-in customers | Measure after rollout |

## 4. Scope and priorities
**P0 / V1 core**: dashboard, lead CRM/manual/CSV intake, customer records, packages and quote revisions, booking and sessions, shared calendar, crew directory and assignments, asset inventory/reservation/custody/condition/return, freelancer portal, production task and media handover log, deliverable tracking, payment and payout ledger, event costing, basic reports, audit and RBAC. **P0 conditional**: private gallery and photo proofing if owner chooses custom delivery; otherwise external gallery links + delivery tracking. Physical pen drive and printed album delivery remain supported.

**P1**: live Meta Instant Form intake and campaign insights after permissions; WhatsApp messaging after opt-in/templates; advanced album annotation and vendor coordination; payment gateway; self-service extended gallery; multi-stockroom transfers when verified; campaign attribution enhancements; customer retention automation.

**P2**: optional AI-assisted culling, consent-governed guest photo discovery (separate privacy review), advanced recommendations, dedicated large-file cloud ingestion/video transcoding, native mobile apps. No commitment in V1.

**Out of scope unless contracted**: public website rebuild, ad buying/optimization service, full accounting/payroll/tax filing, biometric attendance, RAW editing suite, Lightroom replacement, automated damage fines, unlimited storage/backup, public marketplace, permanent archival, native apps, live GPS surveillance, face search for children.

## 5. Stakeholders and access
| Role | Scope | Restrictions |
|---|---|---|
| Owner | Entire workspace, reporting, configuration, approval and overrides | Audit all sensitive actions |
| Operations manager | Bookings, sessions, crew, production, delivery | Financial detail only if granted |
| Sales | Leads, customers, quotes, assigned follow-ups | No payout/internal cost access by default |
| Equipment custodian | Assets, reservations, issue/return, inspection | No customer finance or unrelated galleries |
| Accounts | Collections, refunds, payouts, expenses, reports | No gallery content by default |
| Freelancer | Own assignments, rates, acknowledgements, expenses, media handover | No other freelancer rates or other customer data |
| Editor/designer | Assigned tasks, authorized media, revisions | No unrelated projects or contract values |
| Customer | Own project, quote, payments, milestones, approved gallery, selections | Never see internal notes, costs, crew rates, other customers |
| Vendor (later) | Own order or upload link only | No broad account access |

One person may hold multiple roles; server-side permission checks and record scopes are mandatory. Demo role switch is a simulation, never authentication.

## 6. Target process and state models
Lead → quote versions → accepted quote + booking confirmation criteria → booking with one or more shoot sessions → crew/gear readiness → shoot → media receipt and backup record → parallel production tasks → proof/selection and approval → final deliverables → settlement/closure. Customer collections and freelancer/vendor payouts are independent ledgers; event completion does not imply payment completion. Event-level and deliverable statuses are not interchangeable.

| Entity | Allowed lifecycle (simplified) |
|---|---|
| Lead | New → Contacted → Qualified → Quoted → Negotiating → Won/Lost; reopen with reason |
| Quote | Draft → Sent → Accepted/Declined/Expired/Superseded; accepted revision immutable |
| Booking | Draft/Hold → Confirmed → In progress → Production → Delivered → Closed; Cancelled separately |
| Session | Planned → Ready → In progress → Completed/Cancelled; readiness derived from requirements |
| Crew assignment | Proposed → Accepted/Declined → Completed/Cancelled; payout independent |
| Asset condition | Good / Fair / Damaged / Under inspection / Maintenance / Retired / Lost |
| Asset custody | On hand / Issued; reservations are dated records, not physical custody |
| Reservation | Tentative → Confirmed → Fulfilled/Released/Cancelled |
| Issue line | Issued → Returned / Missing / Damaged (with inspection outcome); partial return supported |
| Task | Todo → In progress → Review → Changes requested/Approved → Done; Blocked with reason |
| Gallery | Draft → Published → Expired/Revoked → Purged (retention policy) |
| Deliverable | Planned → In production → Ready → Released/Dispatched → Delivered; revised/cancelled tracked |
| Payout | Proposed → Approved → Part paid → Paid; adjustment/reversal with audit |

## 7. Functional requirements
Each row is a testable business requirement. P0 is proposed MVP; P1/P2 are optional and not implied by prototype visibility. Gallery rows are P0 only if custom delivery is selected.

### 7.1 Dashboard and calendar
| ID | Priority | Requirement / acceptance criterion |
|---|---|---|
| DASH-01 | P0 | Date and location filters update collections, confirmed booking value, contribution, receivables, upcoming sessions, pending payouts and delivery/gear alerts. Every KPI has definition and drilldown. |
| DASH-02 | P0 | Readiness queue shows unfilled roles, conflicts, overdue returns, deadlines, customer approvals and follow-ups; click opens filtered records. |
| CAL-01 | P0 | Month/week/list calendar for sessions, reservations and due dates; filter by crew, service area and event type. |
| CAL-02 | P0 | Show actual time interval plus configurable travel/setup buffer; overlapping resources cannot be confirmed without authorized policy exception where permitted. Physically unavailable gear is never silently overridden. |

### 7.2 Sales and marketing
| ID | Priority | Requirement / acceptance criterion |
|---|---|---|
| CRM-01 | P0 | Create enquiry with name, contact, event type/date, venue, source, budget range, owner and notes. Required fields validated; event date may be unknown. |
| CRM-02 | P0 | Search/filter table and pipeline; change stage with timestamp; lost requires reason; next action is visible. |
| CRM-03 | P0 | Flag potential duplicates by normalized phone/email; allow legitimate repeat events, merge only with explicit confirmation and preserve history. |
| CRM-04 | P0 | Log call/message/note, next follow-up and outcome; reminder queue shows overdue and today; no claim to read personal WhatsApp chats. |
| CRM-05 | P0 | CSV import with mapping, preview, duplicate and error summary; manual campaign/source tracking. |
| MKT-01 | P1 | Authorized Meta Instant Form webhook + retrieval, signature validation, idempotent lead ID, retry/reconciliation, reconnect health and sync time. |
| MKT-02 | P1 | Import authorized campaign spend and map campaign/ad identifiers; distinguish unattributed leads. For WhatsApp or website campaigns use approved channel integration or manual attribution. |
| MKT-03 | P0 | Manual spend data supported; show CPL = spend / attributed leads, cost per confirmed booking = spend / attributed bookings, booked-value/spend and collected-value/spend separately; divide-by-zero is N/A. Define cohort/window and cancellations; no false revenue attribution. |
| MKT-04 | P1 | Consent-based follow-up and campaign-level report; no campaign editing or ad budget changes without separate scope. |

### 7.3 Packages, customers, quotes and booking
| ID | Priority | Requirement / acceptance criterion |
|---|---|---|
| QTE-01 | P0 | Service and package catalogue with price, deliverables, quantities, tax settings, validity; quote copies price at issue, not live catalogue value. |
| QTE-02 | P0 | Create quote with line items, discounts, optional extras, terms, advance and milestones; validate nonnegative amount and tax/discount calculation. |
| QTE-03 | P0 | Printable branded quote; revisions and acceptance history; latest accepted revision locks commercial values. |
| QTE-04 | P0 | Convert accepted quote to booking once; hold expiry, minimum advance and exceptions configurable. Repeated conversion cannot duplicate booking. |
| QTE-05 | P1 | Secure customer acceptance and agreement workflow; no claim of legally qualified digital signature without provider/legal confirmation. |
| EVT-01 | P0 | Booking detail contains customer, services, sessions, delivery promises, finance, history and owner. One customer can have multiple bookings. |
| EVT-02 | P0 | Multi-day wedding sessions have independent dates, start/end, venue, team roles/counts, gear kit and shot notes. |
| EVT-03 | P0 | Readiness derived per session from confirmed crew/available gear and required items; missing role warning. |
| EVT-04 | P0 | Reschedule preview identifies impacted reservations, assignments and deadlines; reconfirm resources. Cancellation releases future reservations and creates refund review; never deletes issued custody or accounting history. |
| EVT-05 | P0 | Customer requirements/shot list, emergency contacts and internal notes separated from customer-facing copy. |

### 7.4 Crew and freelancer operations
| ID | Priority | Requirement / acceptance criterion |
|---|---|---|
| CREW-01 | P0 | Directory: skills, location, contact, rate defaults, active status, availability blocks and history. Sensitive payment information restricted. |
| CREW-02 | P0 | Assign people to individual sessions/roles with agreed rate, basis, quantity, expense policy and acceptance deadline. Rate snapshot persists after directory changes. |
| CREW-03 | P0 | Candidate picker filters skills/availability/overlap; show reasons unavailable; no silent double booking. |
| CREW-04 | P0 | Freelancer accepts/declines own assignment; rejection reopens staffing requirement; manager can reassign with reason. |
| CREW-05 | P0 | Crew can view own schedule, call time, venue, contact, requirements, issued assets, handover and payout history in mobile PWA. |
| CREW-06 | P0 | Manual check-in/out or manager completion with audit; no mandatory GPS. Expense claim attaches receipt, approve/reject, link to project. |
| CREW-07 | P1 | Skill/reliability rating with objective context; recommended crew via rules before AI; no automatic blacklisting. |

### 7.5 Equipment and physical custody
| ID | Priority | Requirement / acceptance criterion |
|---|---|---|
| AST-01 | P0 | Register serialised asset with stable ID, QR token, category, make/model, serial, purchase date/value, home/current location, condition and service history. Duplicate serial check by agreed scope. |
| AST-02 | P0 | Track quantities for non-serial accessories separately; kits are templates of components; no double counting asset inventory. |
| AST-03 | P0 | Reserve assets for session time window plus buffer. Reject conflicting confirmed reservations and maintenance windows, including concurrent submissions. |
| AST-04 | P0 | Issue gear by scan/manual ID to named custodian for session; record issue timestamp, due-back, inspection and condition evidence; require confirmation. Asset cannot be issued twice. |
| AST-05 | P0 | Return by individual item with condition, photos optional/required by policy, accessories and note; partial return keeps outstanding items with custodian. Damaged returns enter inspection/maintenance rather than become available. |
| AST-06 | P0 | Overdue derived from open issue and due-back; report responsible custodian; lost/damaged workflows require manager review. No automatic deductions. |
| AST-07 | P0 | QR print sheet, individual movement history, asset search, export, manual fallback if no camera permission/network. QR contains opaque asset identifier, no PII or access credential. |
| AST-08 | P0 | Maintenance schedule, cost, vendor, service history; quarantine blocks issue/reservation; release only after inspection. |
| AST-09 | P1 | Transfer between confirmed stockrooms with dispatch/receipt and in-transit custody; physical audit and stock variance review. |
| AST-10 | P1 | Utilization = occupied eligible hours / eligible hours, defined maintenance exclusions; purchase vs rental analysis uses actual costs and no invented ROI. |

### 7.6 Shoot, media handover and production
| ID | Priority | Requirement / acceptance criterion |
|---|---|---|
| PROD-01 | P0 | Complete session with shoot notes, handover status and expected media. Completion does not imply all files received. |
| PROD-02 | P0 | Log card/drive batch, owner, count/size, recipient, date, storage location label, verification and backup copies; no cloud RAW requirement. Never claim copy verified without confirmation. |
| PROD-03 | P0 | Independent tasks for culling, photo editing, video editing, reel, album design, QC; due dates, assignees, dependencies and status; templates by package. |
| PROD-04 | P0 | Task review/revision with comments, version identifier and reviewer; block on missing input; late and upcoming tasks filterable. |
| PROD-05 | P0 | Deliverable-level tracking: promised vs completed counts, due date, file/link/physical item, client approval and release. Parallel deliverables supported. |
| PROD-06 | P1 | Album design version proof with page-level comments, vendor print order, QC and reprint tracking. V1 may use notes/link and status. |
| PROD-07 | P1 | Optional direct freelancer upload with per-assignment scope, quota, resumability and verification; confirm data volumes first. |

### 7.7 Customer delivery and galleries
| ID | Priority | Requirement / acceptance criterion |
|---|---|---|
| GAL-01 | P0* | Create private collection linked to booking with sections, cover, access policy, expiry and allowed download resolutions. Draft invisible to customer. |
| GAL-02 | P0* | Upload final JPEGs and pre-encoded videos with per-file status, retry and progress; verified object metadata before publish. No upload bytes through API server. |
| GAL-03 | P0* | Responsive thumbnail gallery, pagination, lightbox, keyboard navigation, favorites with stable file IDs and downloadable selection list. |
| GAL-04 | P0* | Customer submits album selection against package count; studio sees same selected IDs; reopening creates an auditable change. |
| GAL-05 | P0* | Release eligible original/preview downloads by permission; if payment lock configured, previews may remain accessible; server enforces release, not UI only. |
| GAL-06 | P0* | Separate private link/invite, revocation, expiration, short-lived object access, rate limits, access logging and configurable retention/deletion. Expiration does not mean deletion until purge policy executes. |
| GAL-07 | P0 | External Pixieset link or physical delivery supported with status, expiry, reference and recipient acknowledgement. |
| GAL-08 | P0 | Physical delivery: item type, quantity, cost, pickup/courier, tracking reference, dispatched/delivered dates, evidence or acknowledgement. |
| GAL-09 | P1 | Bulk download via prebuilt limited-size ZIP bundles or asynchronous bounded worker; never unbounded synchronous ZIP on API process. |
| GAL-10 | P1 | Family/guest invites, optional paid extension, client-approved gallery sharing; no public indexing. |
| GAL-11 | P2 | Opt-in photo discovery only after separate privacy, biometric, child-safety, vendor and retention review. |

### 7.8 Finance, reporting and retention
| ID | Priority | Requirement / acceptance criterion |
|---|---|---|
| FIN-01 | P0 | Customer ledger records amount, date, method, reference, milestone, verification and receipt. Part payment, refund and reversal preserve audit. |
| FIN-02 | P0 | Due = approved contract value plus approved changes minus net verified collections; show tax treatment explicitly and don't mix GST with earned revenue. |
| FIN-03 | P0 | Crew payable derived from accepted agreed rates plus approved expenses/adjustments, less verified payouts. Partial payout and approval supported; avoid double counting reimbursements. |
| FIN-04 | P0 | Project expenses categorized (crew, vendor, travel, print, rentals, allocated marketing, other); planned vs actual; attachments and approval. |
| FIN-05 | P0 | Event contribution = net contract value excluding pass-through tax − committed/actual direct costs (label basis); not net profit, no implied overhead/depreciation treatment. Report cash flow separately. |
| FIN-06 | P0 | Close project only after delivery and cost review or authorized exception; receivables/payouts remain visible if outstanding. |
| FIN-07 | P0 | CSV reports by date, project, service, location, freelancer, outstanding collection, payout, asset custody and delivery; role-scoped exports. |
| FIN-08 | P1 | Branded invoices with accountant-approved numbering/GST, online payments and verified idempotent payment webhook. Not full statutory accounting. |
| AUTO-01 | P0 | In-app reminders for follow-up, event, assignment, overdue gear, task, due balance and gallery expiry. |
| AUTO-02 | P1 | Official WhatsApp/email adapters, consent and template policy, opt-out, delivery status, retry and usage limits; no automatic sending from prototype. |
| RET-01 | P1 | Customer repeat event history, consent-based anniversary/review/referral reminders. No automatic targeting inferred from family/child photos. |
| SYS-01 | P0 | Configuration: service types, roles, templates, locations, policies, numbering, retention, finance settings and audit trail. |

## 8. Business rules and exceptions
- Distinguish a booking (commercial order) from sessions (scheduled jobs), crew assignment (person + session), reservation (dated intent), asset issue (actual physical custody), production task (work), and deliverable (customer promise). Do not collapse into one status column.
- Availability checks use half-open intervals [start, end), timezone Asia/Kolkata and configurable buffers. Database transaction/constraint must protect concurrent booking/issue operations; calendar UI alone is insufficient. A freelancer who declines frees assignment, not unrelated asset reservations.
- No asset marked available while still issued, missing, quarantined, retired or in maintenance. Reservation cancellation never clears an open issue. Show future reservations separately from current possession.
- Quote and payout agreed rates are snapshots. Changes require version/approval, not retroactive modification of history. Currency stored as integer paise or exact decimal; no floating-point financial accounting.
- Record cancelled sessions, postponements, partial return, partial payment, declined crew, late media, client selection overdue, failed upload, gallery expiry, additional revision and disputed damage as first-class exceptions.
- Keep customer approvals, external links and delivery state distinct from internal QA. Do not promise all photos edited unless package specifies it.
- Physical delivery stays possible for large files, low-connectivity customers or preference. Client retains independent local archive; cloud delivery is not automatically a backup.

## 9. Logical data model (not final DDL)
| Domain | Core records / relationships |
|---|---|
| Identity | user, role/permission, user role, customer, freelancer profile (optional linked user), location |
| Sales | lead, lead activity, campaign/spend snapshot, service/package, quote, quote revision/items |
| Booking | booking (customer + accepted quote), session, session requirement, crew assignment |
| Assets | asset, accessory stock/kit component, reservation, issue header/lines, inspection/maintenance |
| Production | media handover batch, task, task review, deliverable, gallery, media object, selection/selection item |
| Finance | collection/refund transaction, payout, expense/adjustment, allocation reference |
| Platform | notification, audit event, integration sync state, retention/deletion job |

Use existing Myurrix auth/storage packages if compatible. Prefer lean schema with explicit constraints and foreign keys, not table-per-status or premature generic workflow engine. Archive records rather than destructive deletion of financial/custody history. Final schema based on approved scope and existing packages.

## 10. Non-functional and production requirements
| Area | Proposed acceptance target / design |
|---|---|
| Performance | Paginated operational lists; target p95 <500 ms for normal indexed read APIs excluding network/media, measured with agreed dataset and concurrency; avoid polling storms and N+1. |
| Usability | Keyboard access, visible focus, WCAG 2.2 AA target, semantic labels, mobile crew flows, clear empty/loading/error states, manual QR fallback. |
| Reliability | Idempotent external events, transaction-safe money/custody, retryable background jobs, observability and recovery procedures. Availability SLA and RPO/RTO to be contracted; propose DB daily backup and test restore, not a guarantee. |
| Security | TLS, least privilege, server record authorization, private objects, short-lived access, secret rotation, audit redaction, rate limits, safe content validation, upload limits, CSRF/session safeguards as applicable. |
| Privacy | Use minimum customer/crew PII; no real client media in public demo; permissioned galleries, no indexing, revocable invites; contractual retention and deletion; review applicable Indian privacy obligations with counsel. Special caution for children's imagery and biometrics. |
| Scalability | Modular monolith; PostgreSQL indexes on project/date/status and resource intervals; object store for media; bounded asynchronous thumbnails and archives; no microservices requirement. |
| Compatibility | Modern Chrome/Edge/Safari/mobile; network interruption and low-bandwidth thumbnails; timezone Asia/Kolkata; INR, Indian date formatting. |
| Monitoring | API latency, DB load, errors, job backlog, storage bytes/object count, upload failures and integration sync health; alert owner for business exceptions separately. |

## 11. Architecture and media economics
Next.js + TypeScript frontend; FastAPI modular monolith; PostgreSQL; existing Myurrix Auth/RBAC and storage abstraction where tested; S3-compatible private object storage (e.g. R2); separate bounded background worker only when needed. The API authorizes individual object keys, signs operations and finalizes after metadata validation; browser transfers directly. Multipart upload tracks upload ID/part ETags and resumes supported sessions [S8–S9]. Enforce CORS, size/type/quota, abandoned-part cleanup and per-role upload authorization. Keep originals private; thumbnails accessed by authorized routes/short-lived links. Do not expose an entire bucket. Avoid synchronous bulk ZIP/transcoding or loading full media into Python RAM. Studio retains redundant local RAW archive; upload finished media only unless separately approved.

Illustrative steady-state storage = monthly events × delivered GB/event × retention months, plus thumbnails/archives/overlap. Example 20 events × 25 GB × 2 months = 1,000 GB before derivatives. At illustrative $0.015/GB-month standard storage and ₹90/USD = ₹1,350/month gross raw storage, excluding free tier, request costs, taxes, processing, backups, support. R2 current pricing should be rechecked at proposal time [S10]. No promise of unlimited usage, permanent archive or free video processing. Confirm actual file sizes, frequency and access before committing included quotas. Agree max storage, event upload limit, retention, expiry reminders, extension rates and master backup responsibility.

Meta integration: actual lead source and Business/Page/ad account access determine feasibility. Official lead webhooks and retrieval require authorized access; review and permissions may be required [S11–S12]. Use mock data in demo, no external keys. Payment and WhatsApp adapters are separately scoped and charged.

## 12. Demo dataset and end-to-end acceptance scenarios
**Synthetic anchor:** Rahul & Priya Wedding, Chennai, contract ₹1,50,000 before tax, verified advance ₹50,000, due ₹1,00,000. Sessions: 2 Dec 2026 pre-wedding; 5 Dec sangeet; 6 Dec wedding; 7 Dec reception. Customer and crew names are fictional. Direct planned costs ₹82,500 = crew ₹40,000 + editing ₹15,000 + printing ₹12,000 + travel ₹6,000 + rental ₹4,000 + ads allocation ₹2,500 + other ₹3,000; planned contribution ₹67,500 (45%). Keep actual/committed labels distinct. Asset CAM-001 Sony A7 IV, LEN-001 lens, KIT-001 template; CAM-002 deliberately conflicts with another confirmed event. Historic gallery: fictional Kavin & Meera, November event with 12 authorized sample photos; never publish actual client/child photos without permission.

| UAT ID | Scenario | Expected result |
|---|---|---|
| U01 | Add lead, schedule follow-up, create quote, discount, accept and confirm advance | One booking linked to accepted quote; all related views update; duplicate conversion rejected |
| U02 | Add four sessions; assign unavailable crew and overlapping asset | Conflict shown with reason; confirmation blocked; alternate selection works |
| U03 | Issue 3 items; return 2, flag 1 damaged and leave another scenario outstanding | Custody and overdue states correct; damaged asset quarantined; issue history intact |
| U04 | Freelancer declines, replacement accepts; completes session and logs media handover | Role reopens then filled; assignment reflected in crew portal and dashboard |
| U05 | Complete parallel photo/video tasks; request revision; approve and release deliverable | Status and due dates update; customer sees only public milestones |
| U06 | Publish gallery, select photos, submit selection, release download, revoke access | Same selection visible to owner; expired/revoked authorization rejected in production |
| U07 | Record part collection ₹25,000 and payout; reverse erroneous payment | Receivable becomes ₹75,000 before reversal; totals and audit consistent; no duplicate transaction |
| U08 | Cancel/reschedule event with open gear issue | Future reservation released/reconfirmed; physical custody untouched; refund review created |
| U09 | Attempt other customer's project/media and another crew member's payout | Server denies; no data leakage; record scope enforced |
| U10 | Interrupt upload and retry; quota exceeded; expire gallery | No unverified file published; clear recovery; deletion policy independent of expiry |
| U11 | Import same Meta lead twice; disconnect token | One lead; error visible; manual fallback remains |
| U12 | Mobile keyboard and screen reader walkthrough | Accessible labels, focus, no horizontal overflow except contained tables |

## 13. Delivery plan and sign-off gates
1. Discovery: document observed process, sample anonymized quotes/asset register/payout/lead data, existing Pixieset plan, consent/retention and owner approval. Agree commercial scope and baseline metrics.
2. Interactive sales prototype: synthetic connected data, full visual design, no live integration/auth/payment/storage. Stakeholder validates workflow and priorities.
3. P0 build: business data, auth, resource concurrency, custody, finance and production; customer delivery strategy chosen. Unit/integration tests and role security.
4. Conditional integrations/media: provider setup, permissions, quota, storage and recovery tests. P1 separately estimated.
5. Pilot: inventory labeling/import, crew training, owner trial with real work and backup fallback. Acceptance against agreed UAT; production deployment only after security and restore testing.
6. Support: define incident severity, hours, change requests, retention/overage and termination/data export. No automatic SLA or unlimited support implied.

## 14. Discovery checklist / blockers
- Is Pixieset only a portfolio/contact site or actively used for CRM, booking, proofing or delivery? What plan and export/integration access?
- Actual event volume, seasonal peaks, ticket size, package items, locations, stockrooms, employees/freelancers and roles?
- Meta ad destinations, spend, lead capture fields, attribution and follow-up owner? Account/admin access and review eligibility?
- Gear serial numbers, kit components, accessories, return practice, current custody, damage/loss policy, handover evidence, rental/transfer needs?
- Who assigns crew, rate basis, advance/expenses, acceptance and cancellations? Who holds customer contact data?
- Who edits, how RAWs arrive, backup copies, naming, QA, revisions, album vendor and deadlines?
- Typical/p95 JPEG, video and RAW sizes; upload connection, retention; pen drive cost and customer preference; storage responsibility?
- Advance and payment milestones, tax registration, invoice format, actual costs, refunds and discounts; payment lock preferences?
- Brand asset: approved original SVG/transparent PNG, variants, brand guidelines, permission to use gallery images. No standalone logo verified from website text; fallback wordmark must be labeled provisional.
- Commercial acceptance: budget, delivery date, included features, accounts, storage, support, data export and third-party cost responsibility.

## 15. Source register (accessed 24 Nov 2026)
S1. https://timbrelstudio.mypixieset.com/ — public studio description/service areas.
S2. https://timbrelstudio.mypixieset.com/contact/ — contact form and Pixieset platform.
S3. https://pixieset.com/studio-manager/ — advertised booking/CRM features.
S4. https://pixieset.com/client-gallery/ — advertised delivery/proofing.
S5. https://website-help.pixieset.com/en/articles/9181249-using-projects-to-organize-your-client-work — linked project workflow.
S6. https://shootbook.in/ — vendor-advertised Indian studio management features.
S7. https://www.dodo-studio.in/ — vendor-advertised crew/equipment/production management.
S8. https://developers.cloudflare.com/r2/api/s3/presigned-urls/ — direct signed access.
S9. https://developers.cloudflare.com/r2/objects/upload-objects/ — multipart upload.
S10. https://developers.cloudflare.com/r2/pricing/ — verify pricing before quote.
S11. https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-leadgen/ — Meta lead webhook.
S12. https://developers.facebook.com/docs/marketing-api/guides/lead-ads/retrieving/ — lead retrieval permissions.

**Approval:** Owner / Myurrix / date: pending. Requirements remain proposed until written scope sign-off.
