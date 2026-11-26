# Timbrel Studio OS design system

## Direction

Editorial warmth and operational precision. The owner interface uses structured operational lists, a graphite-olive sidebar, white surfaces and forest actions. Freelancer screens prioritize large mobile actions and short job cards. Customer screens use ivory, serif typography and photography. All workspaces share the same semantic status colors and components.

## Tokens

| Token | Value |
| --- | --- |
| Canvas / surface / muted surface | `#F5F4F0` / `#FFFFFF` / `#EEEBE5` |
| Ink / secondary / muted | `#242521` / `#555A52` / `#666B64` |
| Border | `#E1DED6` |
| Sidebar / active / foreground / muted | `#202521` / `#394139` / `#F5F2EB` / `#B9C0B7` |
| Primary / hover / foreground | `#344C40` / `#283D32` / `#FFFFFF` |
| Brass accent / accessible brass ink | `#A47B46` / `#795329` |
| Gallery | `#F7F3EA` |
| Success background / ink | `#E8F2EA` / `#276141` |
| Warning background / ink | `#FFF0D7` / `#85510B` |
| Danger background / ink | `#FBE9E6` / `#A33832` |
| Info background / ink | `#E6EEF7` / `#345C86` |
| Neutral background / ink | `#EDEDE9` / `#4F5650` |
| Focus | `#497B69` |

Declared centrally in `app/globals.css`, with Tailwind v4 theme exposure. Component colors reference tokens. Chart fills use low-opacity forest and brass for meaningful financial series only. Status combines text and a marker; color is supplementary.

## Typography and geometry

Bundled Inter 400/500/600/700 for operational UI. Bundled Cormorant Garamond 400/500 for customer editorial titles. System fallbacks remain available. Main owner titles are 28px desktop/24–25px mobile; gallery title 72px desktop/54px mobile. Numeric values use tabular figures. Typography is compact in metadata, with readable labels and full details in record views.

Use a 4px spacing base; page gutters 32/24/16px; panels approximately 10px radius; controls 7–8px; subtle 1px borders. Shadows are reserved for dialogs and feedback. Motion uses brief opacity/transform transitions and respects reduced-motion preference.

## Components

- `Button`: primary forest, secondary outlined, ghost and destructive; disabled actions include a visible contextual explanation or title.
- `Badge`: semantic status text and marker. `Metric`: derived values with definitions and drilldowns.
- `PageHeader`, `Panel`, `Table`, `RecordLink`, `FilterBar`, `Tabs`, `Select`, `Field`, `Avatar`, `Empty`: common information hierarchy and controls.
- `Modal`: Radix focus trap, Escape, accessible title/description, close control and focus restoration. `FormModal`: labeled native controls, validation feedback and save/cancel actions.
- `BrandMark`: original supplied asset, correct aspect ratio, neutral panel and text fallback; one source shared across applications.
- Domain features compose these primitives: quote summary/editor, assignment and reservation pickers, movement timeline, payment ledger, album selection bar, lightbox, job cards.

## Responsive and accessibility behavior

Owner sidebar becomes a drawer below 1024px and supports compact icon navigation on desktop. Operational tables scroll inside their own wrappers. Freelancer content is centered at up to 600px with fixed Home/Jobs/Gear/Payouts navigation and safe-area padding. Customer gallery uses three desktop and two mobile columns with reserved image dimensions.

Keyboard-accessible stage/status dropdowns provide alternatives to dragging. Dialogs trap focus; lightbox supports arrows and Escape. Forms use associated labels, errors use alert regions, successful mutations update visible records and status feedback. Icon-only controls have accessible names. Target mobile actions are at least 44px. AA semantic text contrast is checked separately from stock-image composition; imagery remains sample content with a disclosure.

## Assets

Brand and stock provenance are recorded under `public/brand/ASSETS.md` and `public/demo-media/ASSETS.md`. Never treat illustrative stock as actual customer work. Gallery file IDs are independent of image URLs; local preview object URLs are revoked and never persisted. Client downloads contain a clearly labeled sample manifest.
