# design.md — Baan Brew Dashboard (Web + Mobile)

Design spec for https://baanbrew-dashboard-sandy.vercel.app/#overview. It keeps what the live app already does (Tailwind slate/sky look, 16px cards, pill branch chips) and defines how it should look and behave on a desktop web app and on a phone. Tokens referenced here live in `tokens.json`.

## 1. What exists today (read from the live app)

- Header: "บ้านบรู Dashboard" (24px bold, slate-800).
- Tab bar (3 tabs): ภาพรวมยอดขาย (active), ข้อมูลลูกค้า, Lab 2.2 · ซ่อมกราฟแย่.
- Filter card: branch chips ทุกสาขา / สยาม / สีลม / บางนา / มหาวิทยาลัย / อารีย์ (active = sky fill, white text), then date range ตั้งแต่ / ถึง.
- 4 KPI cards: ยอดขายรวม ฿4,463,443 · จำนวนบิล 34,773 · ยอดเฉลี่ยต่อบิล ฿128 · ลูกค้าสมาชิก (ไม่ซ้ำ) 2,507.
- Chart 1: ยอดขายรายวัน, line chart, raw daily line (light blue) plus 7-day average (dark blue), 19 เม.ย. 68 to ก.ย. 69.
- Chart 2: ยอดขายแยกสาขา, bar chart, one bar per branch.
- Data: CSV, one row per line item (order_id, datetime, branch, product_id, qty, unit_price, customer_id, payment_method, channel). Revenue = qty × unit_price. Empty customer_id = walk-in.

Not read: the ข้อมูลลูกค้า tab content. Section 6 proposes it from the CSV schema; confirm against the real tab.

## 2. Design principles

1. Numbers first. KPI values are the largest text on screen; chrome stays quiet.
2. One filter state. Branch and date range apply to every card on every tab and show as chips so the active scope is always visible.
3. A branch keeps its color everywhere (chips, bars, legends, tooltips).
4. Thai-ready. Line height at least 1.5 for Thai text, tabular numerals for money, no truncating Thai mid-cluster.
5. Same components on both surfaces; only layout changes at breakpoints.

## 3. Foundations

Color (light / dark in `tokens.json`):

| Role | Token | Light |
| --- | --- | --- |
| Page | `bg-page` | #f8fafc |
| Card | `bg-surface` | #ffffff |
| Ring/dividers/grid | `border` | #e2e8f0 |
| Text | `ink` / `ink-muted` | #1e293b / #475569 |
| Primary | `brand` / `brand-strong` | #0284c7 / #0369a1 |
| Selected tint | `brand-tint` | #e0f2fe |
| Branches | `series-siam`, `-silom`, `-bangna`, `-university`, `-ari` | #0284c7, #ea580c, #6d28d9, #047857, #a16207 |
| Delta | `positive` / `negative` | #15803d / #b91c1c |

Typography: Noto Sans Thai (fallback system sans). page-title 24/36 bold, card-title 18/28 bold, kpi-value 28/40 bold (mobile 24/32), label 14/22 medium, body 14/22, axis 12/18. Use `font-variant-numeric: tabular-nums` on all numbers.

Shape and space: cards `radius-lg` 16, tabs/inputs/buttons `radius-md` 12, chips `radius-pill`. Card padding 16 on mobile, 24 on web. Grid gap 12 mobile, 24 web. Card style: `bg-surface` + `shadow-card` (1px ring plus a soft 1px lift).

Touch and focus: minimum target 44×44 on mobile, 36px height on web. Focus ring 2px `brand-strong` with 2px offset. Never color alone: active chip also gets a check icon or bold weight.

## 4. Components

- **Tab bar**: segmented pills inside one white card. Active = `brand-strong` fill, white 14px medium text; inactive = `ink-muted` on transparent; hover `brand-tint`. Web: top, inline. Mobile: moves to a fixed bottom nav (section 6).
- **Branch chip**: pill, 6×14 padding, 14px medium. Idle: white, 1px `border`, `ink-muted`. Active: `brand-strong` fill, white text. "ทุกสาขา" is exclusive; picking a branch deselects it. Allow multi-select of branches (proposed) with each selected chip showing its branch color dot.
- **Date range**: two date inputs, `radius-md`, 1px `border`; web shows both inline with a preset menu (7 วัน, 30 วัน, ปีนี้, ทั้งหมด); mobile opens a bottom sheet.
- **KPI card**: label (14 muted) above value (kpi-value), optional delta line (12, `positive`/`negative` with ▲/▼ glyph) comparing with the previous equal period. Money formatted ฿#,###; bill count #,###.
- **Chart card**: title (card-title) left, legend right (web) or below (mobile). Chart area has 1px `border` dashed gridlines, `axis` text in `ink-muted`.
- **Tooltip**: white card, `shadow-card`, date or branch in muted, value in ink bold; lists every series with its color dot.
- **Empty / loading / error**: skeleton blocks in `border` color at card size; empty = "ไม่พบข้อมูลในช่วงที่เลือก" with a reset-filters button; CSV parse error = inline banner above the filters with the file/row hint.

## 5. Web app (≥ 1024px)

Container max-width 1280, gutters 32, 12-column grid, gap 24.

```
┌ Header: บ้านบรู Dashboard ........................ [date preset ▾] ┐
├ Tab bar: ภาพรวมยอดขาย | ข้อมูลลูกค้า | …                            ┤
├ Filter card: [ทุกสาขา][สยาม][สีลม][บางนา][มหาวิทยาลัย][อารีย์]  ตั้งแต่ [ ] ถึง [ ] ┤
├ KPI ×4  (each 3 cols): ยอดขายรวม | จำนวนบิล | ยอดเฉลี่ยต่อบิล | สมาชิก ┤
├ ยอดขายรายวัน (8 cols, 360px chart) │ ยอดขายแยกสาขา (4 cols, horizontal bars, sorted desc) ┤
└ (optional) ตารางสรุปรายสาขา: สาขา, ยอดขาย, บิล, เฉลี่ย/บิล, สมาชิก — full width ┘
```

- Filter card is sticky under the tab bar on scroll (shadow appears when stuck).
- 768–1023px: KPIs 2×2, charts stack full width, chart height 320.
- Daily sales chart: raw daily line `brand-tint`-light stroke (#7dd3fc) 1.5px; 7-day average `brand` 2.5px; hover shows crosshair + tooltip; drag-select to zoom the date range (updates the filter). Y axis ฿0–฿20,000 in 5,000 steps, auto-scaled; X ticks every ~8 weeks, Thai Buddhist short dates.
- Branch chart: horizontal bars at web width (labels never rotate), colored by branch, value label at bar end in `ink`; clicking a bar sets the branch filter.

## 6. Mobile app (< 768px, designed at 375×812)

Gutters 16, single column, gap 12.

```
┌ Header 56px: บ้านบรู        [filter ⚙ 2] ┐   sticky
├ Active scope chips: สยาม ✕  1 ก.ค.–30 ก.ย. ✕ ┤   horizontal scroll
├ KPI 2×2 grid                                 ┤
├ ยอดขายรายวัน card (chart 220px, legend below) ┤
├ ยอดขายแยกสาขา card (horizontal bars)          ┤
└ Bottom nav 64px: ภาพรวม | ลูกค้า | Lab      ┘   fixed, safe-area aware
```

- Branch chips become one horizontally scrolling row (snap, no wrap) under the header; the date range and any advanced filters live in a bottom sheet opened by the filter button (badge shows count of active filters).
- KPI cards: value 24/32; ยอดเฉลี่ยต่อบิล and ลูกค้าสมาชิก keep the full Thai label, wrapping to 2 lines rather than truncating.
- Daily chart: touch and hold to scrub with a floating tooltip, pinch/two-finger to zoom the range, 4 X ticks maximum (Thai short month and year), Y axis in ฿k format (฿5k, ฿10k).
- Bottom nav replaces the top tab bar; active item = `brand-strong` icon and label with a `brand-tint` pill behind the icon. Tab labels shortened: ภาพรวม, ลูกค้า, Lab.
- Landscape and tablet portrait (≥600px): KPIs 4 across, charts remain stacked.
- Pull-to-refresh reloads the CSV; show last-updated time in the footer in `axis` style.

## 7. ข้อมูลลูกค้า tab (proposed, from the CSV schema)

Same shell, filters and card styles. KPIs: สมาชิกไม่ซ้ำ, สัดส่วนบิลสมาชิก (%), ยอดเฉลี่ยต่อสมาชิก, บิลต่อสมาชิก. Charts: สมาชิก vs ลูกค้าทั่วไป over time (two lines: member, walk-in), ช่องทางการชำระเงิน (payment_method, horizontal bars), ช่องทางขาย (channel, donut max 5 slices with direct labels), top สินค้า by revenue (product_id). Use neutral `series-*` colors by category order; branch colors stay reserved for branches.

## 8. Accessibility and data rules

- Text 4.5:1 on its surface in both themes; chart lines and bars 3:1 against the card. Known source issue: white 14px text on #0284c7 is about 4.1:1, so small text uses `brand-strong`.
- Every chart has a text summary (e.g. "ยอดขายเฉลี่ย 7 วันล่าสุด ฿9,000") and a "ดูเป็นตาราง" toggle.
- Respect `prefers-reduced-motion` (no chart entry animation) and `prefers-color-scheme` for the dark theme.
- Currency/date: `Intl.NumberFormat('th-TH')` and `th-TH-u-ca-buddhist` dates; parse CSV datetimes as +07:00 and decode as UTF-8 (known Thai pitfalls).
- All aggregates come from `src/lib/metrics.js`; UI components receive computed series only.

## 9. Implementation notes (React, Vite, Tailwind v4, Recharts)

- Map tokens into `@theme` in the main CSS (`--color-brand`, `--color-surface`, `--radius-lg`…); no `tailwind.config.js` with the v4 Vite plugin. Dark theme via `[data-theme="dark"]` overrides.
- Breakpoints: `md` 768 and `lg` 1024. Use `ResponsiveContainer` for every chart; switch the branch chart `layout="vertical"` at all sizes for Thai label legibility.
- Recharts: `LineChart` with two `Line`s (raw: `dot={false}`, 1.5px; average: 2.5px), `CartesianGrid strokeDasharray="3 3"` using `border`, custom `Tooltip` component, `XAxis tickFormatter` Thai short date, `YAxis tickFormatter` `฿k` on mobile.
- Persist filter state in the URL hash query (e.g. `#overview?branch=siam&from=2025-07-01`) so views are shareable.

## 10. Open questions

- Confirm the ข้อมูลลูกค้า tab contents and the purpose of "Lab 2.2 · ซ่อมกราฟแย่" (hide it from the production nav on mobile?).
- Dark theme is defined in tokens but not present in the live app; confirm whether to ship it.
- Multi-select branches and the drill-down from bars are proposals, not existing behavior.
