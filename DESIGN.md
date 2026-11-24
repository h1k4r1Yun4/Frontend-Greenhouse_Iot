---
name: Smart Greenhouse IoT
description: Warm stone operational workbench with single-hue botanical action green for multi-zone greenhouse telemetry and safe hardware actuation.
colors:
  primary: "#15803D"
  primary-hover: "#166534"
  primary-soft: "#EAF6EE"
  primary-border: "#B7E1C6"
  primary-deep: "#14532D"
  range-optimal: "#9AC4AE"
  canvas-linen: "#F6F4EF"
  surface-white: "#FFFFFF"
  well-linen: "#FAF9F6"
  rail-sand: "#EFECE4"
  border-hairline: "#E6E1D6"
  border-rail: "#E2DDD2"
  border-control: "#D8D2C5"
  ink-primary: "#1F2933"
  ink-slate: "#3E4C59"
  ink-secondary: "#52606D"
  ink-muted: "#616E7C"
  control-off: "#CBD2D9"
  critical: "#BE123C"
  critical-deep: "#9F1239"
  critical-soft: "#FFF1F2"
  critical-border: "#FECDD3"
  warning: "#B45309"
  warning-deep: "#92400E"
  warning-soft: "#FEF3C7"
  warning-border: "#FCD34D"
  info: "#0369A1"
  info-deep: "#075985"
  info-soft: "#F0F9FF"
  info-border: "#BAE6FD"
  thermal-terracotta: "#C2410C"
  hazard-amber: "#D97706"
  hazard-charcoal: "#292524"
typography:
  display:
    fontFamily: '"Be Vietnam Pro", "Segoe UI", system-ui, -apple-system, sans-serif'
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: '"Be Vietnam Pro", "Segoe UI", system-ui, -apple-system, sans-serif'
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Be Vietnam Pro", "Segoe UI", system-ui, -apple-system, sans-serif'
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "0em"
  body:
    fontFamily: '"Be Vietnam Pro", "Segoe UI", system-ui, -apple-system, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: '"Be Vietnam Pro", "Segoe UI", system-ui, -apple-system, sans-serif'
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0em"
  mono:
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace'
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
    fontFeature: '"tnum" 1'
rounded:
  xs: "8px"
  sm: "10px"
  control: "12px"
  well: "14px"
  alert: "16px"
  card: "18px"
  modal: "20px"
  pill: "9999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-disabled:
    backgroundColor: "{colors.border-hairline}"
    textColor: "{colors.ink-secondary}"
  button-secondary:
    backgroundColor: "{colors.rail-sand}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.critical}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  card-surface:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.card}"
    padding: "20px"
  well-surface:
    backgroundColor: "{colors.well-linen}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.well}"
    padding: "14px"
  input-field:
    backgroundColor: "{colors.well-linen}"
    textColor: "{colors.ink-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  badge-neutral:
    backgroundColor: "{colors.canvas-linen}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning-deep}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  badge-danger:
    backgroundColor: "{colors.critical-soft}"
    textColor: "{colors.critical-deep}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  rocker-switch-on:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    width: "56px"
    height: "32px"
  rocker-switch-off:
    backgroundColor: "{colors.control-off}"
    rounded: "{rounded.pill}"
    width: "56px"
    height: "32px"
  nav-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  estop-button:
    backgroundColor: "{colors.critical}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
---

# Design System: Smart Greenhouse IoT

## Overview

**Creative North Star: "The Sunlit Agronomy Workbench"**

This system trades dark-slate monitoring clichés for a sunlit, high-legibility warm-stone workbench built to hold up equally well on a bright lecture-hall projector and on a handheld phone inside a greenhouse. A calm linen ground (`#F6F4EF`) overlaid with subtle organic paper grain, a sand navigation rail (`#EFECE4`), crisp white card surfaces (`#FFFFFF`), and deep charcoal ink (`#1F2933`) keep passive sensor data grounded and unhurried.

Color carries operational authority rather than ornament. Neutral stone surfaces own read-only telemetry and structural framing, while a single saturated botanical green (`#15803D`) appears exclusively on actionable controls, active navigation tabs, and live enabled switches. The moment an operator switches to Viewer mode or latches the industrial Emergency Stop, every green affordance disappears into muted stone—making permissions and hardware lockouts readable across a room without reading a word of copy.

Self-hosted offline Vietnamese typography (`Be Vietnam Pro` paired with tabular `JetBrains Mono`) guarantees crisp alignment across 5-second live telemetry ticks and standalone offline HTML bundles. Honest fallback states (`Chờ dữ liệu...`), explicit semantic warning/critical tints, and 2-step AI approval gates ensure clarity never yields to decorative noise.

**Key Characteristics:**
- Warm linen ground with fine SVG paper texture, soft sand rail, and pure white `18px` cards bounded by `1px` warm stone hairlines.
- Single-hue botanical action accent (`#15803D`) strictly bound to interactive commitments and live enabled hardware controls.
- High-contrast charcoal typography (`Be Vietnam Pro` + `JetBrains Mono` `tabular-nums`) engineered for Vietnamese diacritics and zero numeric jitter.
- Domain-specific visual instrumentation: calibrated crop range bars, 3-band hysteresis deadband visualizers, and an IEC 60947-5-5 hazard-collared Emergency Stop.
- Offline-resilient self-hosted `.woff2` fonts and pure SVG telemetry sparklines requiring zero external network calls.

## Colors

A disciplined warm-stone neutral architecture anchored by one botanical action green and restrained semantic colors strictly tied to physical telemetry and safety states.

### Primary
- **Botanical Action Green** (`#15803D`): Primary interactive CTA buttons, active sidebar and filter pills, enabled actuator rocker tracks, active PWM preset buttons, range slider thumbs, and `:focus-visible` outlines.
- **Botanical Forest Hover** (`#166534`): Hover state on primary buttons, inline navigation links, and active warm-slider thumbs.
- **Botanical Mist Soft** (`#EAF6EE`): Soft surface wash on active actuator icon badges, active mobile bottom-navigation items, confirmed command strips, and quick-prompt hover pills.
- **Botanical Sage Border** (`#B7E1C6`): `1px` perimeter framing botanical confirmation strips, active rule badges, and enabled control icon tiles.
- **Botanical Deep Pine** (`#14532D`): High-contrast text on `#EAF6EE` surfaces and hysteresis reset-point pins.

### Neutral
- **Warm Linen Canvas** (`#F6F4EF`): Application shell canvas (with subtle SVG fractal-noise texture) and sticky topbar background.
- **Pure Surface White** (`#FFFFFF`): Elevated cards, modals, popovers, active role-switcher segments, and compact actuator icon frames.
- **Soft Linen Well** (`#FAF9F6`): Recessed inner containers, resting form inputs, KPI tiles, alert resolved rows, and hysteresis visualizer backing.
- **Warm Sand Rail** (`#EFECE4`): Left sidebar surface, segmented control tracks, table headers, secondary buttons, and hairline card dividers.
- **Warm Stone Hairline** (`#E6E1D6`): Standard `1px` card border, disabled button fill, and resting warm-slider track.
- **Sand Rail Divider** (`#E2DDD2`): Structural `1px` divider for the sidebar, sticky topbar, and mobile bottom bar.
- **Control Stone Border** (`#D8D2C5`): Interactive control perimeter on outline/secondary buttons, form inputs, locked rocker tracks, and scrollbars.
- **Deep Charcoal Ink** (`#1F2933`): Primary display headings, numeric telemetry readouts, active labels, dark tooltip backgrounds, and calibrated range optimal pins.
- **Slate Charcoal** (`#3E4C59`): Neutral pill text, idle navigation labels, hardware node icons, and default soil-moisture sparklines.
- **Medium Charcoal** (`#52606D`): Secondary descriptions, sensor field labels, units, and inactive control text.
- **Muted Stone Ink** (`#616E7C`): Timestamps, node identifiers, scale limits, and placeholder copy.
- **Unlit Switch Track** (`#CBD2D9`): Resting OFF track on actuator switches and inactive equipment indicator dots.

### Semantic
- **Critical Crimson** (`#BE123C`) & **Deep Crimson** (`#9F1239`) over **Rose Mist** (`#FFF1F2`) / **Rose Border** (`#FECDD3`): IEC Emergency Stop button, global `EMERGENCY HALTED` interlock banners, gateway offline warnings, critical threshold alerts, and hysteresis trigger bands.
- **Solar Amber** (`#B45309`) & **Warm Ochre** (`#92400E`) over **Sunlit Cream** (`#FEF3C7`) / **Amber Border** (`#FCD34D`): Gateway LDR light readouts (`Lux`), near-threshold warning states, Viewer read-only notices, pending AI proposals, and industrial hazard collars (`#D97706` paired with `#292524`).
- **Hydro Sky** (`#0369A1`) & **Deep Sky** (`#075985`) over **Ice Sky** (`#F0F9FF`) / **Sky Border** (`#BAE6FD`): Air humidity (`%RH`), water and mist actuator states, PWM driver badges, and informational alerts.
- **Thermal Terracotta** (`#C2410C`): Temperature sensor icons, thermal sparklines, and rising telemetry deltas.
- **Calibrated Optimal Sage** (`#9AC4AE`): Passive optimal band segment on calibrated metric range bars, intentionally softer than `#15803D` interactive green.

### Named Rules
**The Action-First Color Rule.** Reserve saturated botanical green (`#15803D`) strictly for interactive controls, active navigation states, and primary commitments; when a control is disabled by Viewer RBAC or Emergency Stop, strip every trace of green back to neutral stone (`#D8D2C5` / `#E6E1D6`) so lockout is visually unmistakable.
**The Restraint-in-Status Rule.** Healthy microclimate readings remain calm and unbadged (`Trong chuẩn` requires no green pill); introduce semantic amber, crimson, or sky fills only when a sensor approaches or crosses biological thresholds, or when hardware reports an active warning or fault.

## Typography

**Display & Body Font:** `Be Vietnam Pro` (self-hosted offline `.woff2` Vietnamese + Latin subsets, weights `400`, `500`, `600`, `700`, `800`), with fallback `'Segoe UI', system-ui, -apple-system, sans-serif`.
**Mono & Telemetry Font:** `JetBrains Mono` (self-hosted offline `.woff2` Vietnamese + Latin subsets, weights `500`, `600`, `700`), with fallback `ui-monospace, SFMono-Regular, Consolas, monospace`.

**Character:** Geometric humanist letterforms with crisp Vietnamese tone-mark proportions paired against tabular technical figures so dense multi-zone sensor panels stay effortless to scan across rooms and devices.

### Hierarchy
- **Display** (`800`, `26px` desktop / `19px` mobile, `1.25` line-height, `-0.025em` tracking): Primary page headline in the main overview workspace.
- **Headline** (`800`, `20px–24px`, `1.3` line-height, `-0.02em` tracking): Section page titles across Controls, Automation, Alerts, History, and AI Chatbot.
- **Title** (`700`, `15px–16px`, `1.375` line-height): Zone card titles, gateway title, card headings, and modal headers (`18px`).
- **Body** (`400–500`, `14px`, `1.5` line-height, capped around `65ch` / `max-w-2xl` on descriptions): Operational descriptions, form inputs, alert messages, and AI assistant dialogue.
- **Label** (`600`, `11px–12px`, `1.35` line-height): Sensor labels, pill badges, navigation links (`13px`), and micro-scale bounds (`10px`).
- **Mono Telemetry** (`700`, `22px–30px` primary numeric readouts; `11px–14px` inline telemetry and timestamps, `tabular-nums`): Sensor values, deltas, Lux, DLI, PWM levels, wattage, and threshold markers.

### Named Rules
**The Tabular Telemetry Rule.** Render every live reading, delta, timestamp, wattage, and threshold badge in `JetBrains Mono` with `font-variant-numeric: tabular-nums` so 5-second updates never cause horizontal layout jitter.
**The Offline Font Bundle Rule.** Bundle `Be Vietnam Pro` and `JetBrains Mono` locally as inline/self-hosted `.woff2` subsets covering Vietnamese glyphs so offline `file://` execution never degrades to mismatched system fonts.

## Layout

The application uses a full-height split shell (`100vh`) pairing a grounded Warm Sand navigation rail with a scrollable linen workspace crowned by a sticky utility bar.

- **Navigation Rail (`Sidebar`):** On desktop (`>= 1024px`), renders at `240px` width (`w-60`) with a collapse toggle down to a `72px` icon rail (`overflow-visible` so hover tooltips render outside the rail edge). On tablet (`768px–1023px`), defaults cleanly to the `72px` compact rail. On mobile (`< 768px`), collapses into a slide-out drawer (`288px` / `max-w-[85vw]`) paired with a fixed 6-column bottom navigation bar (`44×44px` minimum touch targets, `96px` main bottom clearance).
- **Sticky Top Utility Bar (`Navbar`):** Sticks at `top: 0` on `#F6F4EF` with a `1px` `#E2DDD2` bottom border and `10px` vertical padding (~`60px` height), housing the single-source live sync clock + polling interval pill on the left and the ConnectionBadge mesh popover, segmented Role Switcher, and alert bell on the right.
- **Main Container & Grid:** Content centers inside `max-w-7xl` (`1280px`) with responsive horizontal padding (`14px` mobile, `24px` tablet, `32px` desktop) and a `16px–20px` vertical stack rhythm (`24px` on secondary operational pages).
- **Dashboard Spatial Rhythm:** Upper band places Zone 1 and Zone 2 side by side (`grid-cols-1 lg:grid-cols-2`, `20px` gap), each subdividing into 3 hairline-divided metric wells (`grid-cols-1 sm:grid-cols-3`). Lower above-the-fold operational band uses an asymmetric `1fr 1.6fr` grid (`xl:grid-cols-[1fr_1.6fr]`): `1fr` for the ESP32 Gateway Lux + DLI card and `1.6fr` for the 2×2 compact actuator quick-switch grid, followed by recent alerts below.

### Named Rules
**The Single-Source Sync Rule.** Present the live synchronization timestamp and configurable polling cycle once in the sticky topbar; never duplicate clock badges inside page headers or zone cards.

## Elevation & Depth

Surfaces rely primarily on tonal contrast (`#F6F4EF` canvas -> `#FFFFFF` card -> `#FAF9F6` recessed well) and `1px` warm stone borders (`#E6E1D6`) rather than heavy drop shadows. Whisper-quiet charcoal-tinted shadows (`rgba(31, 41, 51, ...)`) add subtle separation only on cards, hover states, and floating overlays.

### Shadow Vocabulary
- **Card Ambient** (`box-shadow: 0 2px 8px rgba(31, 41, 51, 0.04)`): Resting depth for white primary cards, active segmented control pills, and compact actuator icon badges.
- **Card Hover** (`box-shadow: 0 6px 18px rgba(31, 41, 51, 0.07)`): Gentle hover elevation on interactive cards (`ZoneOverviewCard`, `GatewayLightCard`, `ActuatorToggleCard`, `RuleItemCard`, `ConnectionBadge`).
- **Popover & Overlay** (`box-shadow: 0 12px 32px rgba(31, 41, 51, 0.12)`): Floating hardware mesh popovers, Recharts tooltips, `Modal` dialogs (backed by `rgba(31, 41, 51, 0.45)` blur scrim), mobile drawers, and the fixed mobile bottom nav.
- **Warm Slider Thumb** (`box-shadow: 0 2px 6px rgba(31, 41, 51, 0.2)`): Tactile grip elevation on PWM range slider knobs.

### Named Rules
**The Hairline-Before-Shadow Rule.** Separate interior sections with `1px` `#EFECE4` hairline dividers and `#FAF9F6` tonal wells before reaching for drop shadows; keep card shadows at `0.04–0.07` opacity so elevation never obscures telemetry legibility.

## Shapes

Corner geometry steps inward progressively from outer card shells to inner wells and tactile micro-controls so concentric frames sit cleanly without visual tension.

- **Modal Shells (`20px`):** Overlay confirmation and editor dialogs.
- **Primary Cards (`18px`):** Zone overviews, gateway telemetry, actuator control cards, alert filter bars, charts, and chat containers.
- **Alert & Safety Framing (`16px`):** Emergency halt banners, alert list items, AI action proposals, educational info boxes, and the IEC E-Stop `.hazard-collar` frame.
- **Inner Wells (`14px`):** Compact dashboard actuator tiles, KPI summary wells, hysteresis visualizer panels, sidebar hardware status card, and chat text input.
- **Interactive Controls (`12px`):** Standard buttons, sidebar navigation items, segmented switcher shells, E-Stop actuator button, and square `40px–44px` icon badges.
- **Nested Micro Inputs & Buttons (`10px` / `8px`):** Form inputs and selects (`10px`), modal close buttons (`10px`), compact alert buttons (`10px`), PWM `25%–100%` preset chips (`8px`), and rail hover tooltips (`8px`).
- **Full Pills (`9999px`):** Status badges, rocker switch tracks and thumbs, warm slider tracks and thumbs, calibrated range bars, and quick-prompt chips.

### Named Rules
**The Nested Radius Step-Down Rule.** Maintain a visible concentric step-down from outer containers (`18px` / `20px`) to inner wells (`14px`) to interactive controls (`12px` / `10px` / `8px`) so nested boundaries never pinch or flatten.

## Components

Every control balances daylight clarity with crisp interactive states (`default`, `hover`, `focus-visible`, `active`, `disabled`) and loses all botanical green when locked out.

### Buttons
- **Shape:** `12px` radius (`min-h-[36px]` sm, `min-h-[40px]` md, `min-h-[44px]` lg), `font-semibold`, `active:scale-[0.98]`, `2px` `#15803D` focus-visible ring (`2px` offset).
- **Primary:** `#15803D` background, `#FFFFFF` text, shifting to `#166534` on hover; disabled falls back to `#E6E1D6` fill with `#52606D` text.
- **Secondary / Outline / Ghost / Danger:** Secondary uses `#EFECE4` with `#D8D2C5` border; Outline uses `#FFFFFF` with `#D8D2C5` border hovering to `#FAF9F6`; Ghost uses `#52606D` hovering into `#EFECE4`; Danger uses `#BE123C` (hover `#9F1239`) strictly for emergency/destructive gates.

### Action Rocker Switch
- **Shape:** Pill track (`56px × 32px` full; `48px × 28px` compact) with a `28px` (`24px` compact) white circular thumb carrying an embedded `Power` icon (`200ms ease-out` translation).
- **States:** Enabled ON track lights up `#15803D` with `#15803D` icon; resting OFF track uses `#CBD2D9` with `#616E7C` icon; locked/disabled (`Viewer` or `EMERGENCY HALTED`) shifts track to `#D8D2C5` at `60%` opacity with muted `#7B8794` icon.
- **Card Feedback:** Full actuator cards gain a `#15803D` border and `#EAF6EE` icon well when active and unlocked; compact dashboard switches wash the tile background from `#FAF9F6` to `#EEF5F0`.

### Cards & Divider Wells
- **Primary Container (`Card`):** `#FFFFFF` fill, `18px` radius, `1px` `#E6E1D6` border, `20px` padding, optional `1px` `#EFECE4` header divider.
- **Divider Wells (`ZoneOverviewCard` + `SensorMetricCard`):** Inside each zone card, temperature, air humidity, and soil moisture sit side by side separated solely by `1px` `#EFECE4` hairline dividers (`divide-y sm:divide-y-0 sm:divide-x`) rather than inner bordered boxes. Warning or critical sensor readings wash only that column to `#FFFDF5` or `#FFF5F6`.

### Inputs & Warm Sliders
- **Text, Number & Select Inputs:** `#FAF9F6` fill, `1px` `#D8D2C5` border, `10px` radius (`14px` in chat composer), `8px 14px` padding, shifting to `#FFFFFF` with a `2px` `#15803D` focus ring; disabled state falls back to `#EFECE4`.
- **Warm Slider (`.warm-slider`):** `8px` pill `#E6E1D6` track, `20px` circular `#15803D` thumb with `2.5px` `#FFFFFF` border (`1.08×` scale and `#166534` on hover), switching to `#9AA5B1` at `60%` opacity when locked, accompanied by `25% / 50% / 75% / 100%` mono preset chips (`8px` radius).

### Navigation
- **Sand Rail (`Sidebar`):** `#EFECE4` fill, `#15803D` active item (`12px` radius) with `#FFFFFF` text, `#3E4C59` resting links hovering to `#E6E1D6/70`, dark `#1F2933` tooltips (`8px` radius) in collapsed `72px` rail mode, and a white `#FFFFFF` hardware status card (`14px` radius) anchored at the bottom.
- **Top Utility Bar & Role Switcher (`Navbar`):** Sticky `#F6F4EF` bar carrying the `ConnectionBadge` pill + hardware mesh popover, a segmented `#EFECE4` role switcher (`admin` / `operator` use white active pill; `viewer` switches to `#FEF3C7` amber warning pill with `#92400E` text), and alert bell counter.
- **Mobile Bottom Bar:** Fixed 6-tab white bar (`#E2DDD2` top border, `44×44px` minimum targets, `#EAF6EE` active highlight with `#15803D` icon/label).

### Badges & Safety Modals
- **Semantic Badges (`Badge`):** Pill (`9999px`) `12px` `font-semibold` with `1px` border and optional `6px` status dot across `neutral`, `success`, `warning`, `danger`, and `info`.
- **Safety Modals (`Modal` & `SafeConfirmModal`):** `20px` radius dialog over `rgba(31, 41, 51, 0.45)` `backdrop-blur-sm` (`200ms modal-in`), Escape-to-close, `#FAF9F6` footer action bar, and the 3-stage AI gate indicator (`1. AI Đề xuất → 2. Con người Phê duyệt → 3. Phát lệnh MQTT`) with rose hazard warning before hardware actuation.

### Signature Domain Components
- **Calibrated Range Bar & Sparkline (`SensorMetricCard` + `MiniSparkline`):** Pairs a `28px` smooth cubic Bézier SVG sparkline (18%-to-0% area gradient + endpoint dot, or honest dashed `Chờ dữ liệu...` fallback when `< 2` samples) above a `6px` `#E6E1D6` track highlighting the crop optimal span in `#9AC4AE` and positioning a `12px` circular reading pin (`#1F2933` optimal, `#D97706` warning, `#BE123C` critical) ringed in `2px` white.
- **Hysteresis 3-Band Visualizer (`HysteresisVisualizer`):** Recessed `#FAF9F6` (`14px` radius, `#E6E1D6` border) diagram displaying a `16px` pill track (`#D8D2C5` border) partitioned into Active Trigger (`#E11D48/85`), Relay-Protection Deadband (`#F59E0B` `.hazard-stripes`), and Safe Band (`#15803D/85`). Upper edge-clamped trigger (`#9F1239`) and reset (`#14532D`) pins automatically stagger vertically when separated by less than `24%` track width, paired with a lower live reading pill (`#1F2933` with `#4BAE72` dot).
- **IEC 60947-5-5 Emergency Stop (`MasterControlPanel`):** Crimson `#BE123C` (`hover #9F1239`) actuator button nested inside a `6px` `.hazard-collar` frame (`16px` radius, `-45deg` `#D97706` / `#292524` diagonal stripes) when active, collapsing to neutral `#EFECE4` / `#D8D2C5` when locked by Viewer RBAC; latching E-Stop raises a persistent `#9F1239` `EMERGENCY HALTED` banner across all routes until explicit Re-arm.

## Do's and Don'ts

### Do:
- **Do** restrict `#15803D` botanical green exclusively to interactive controls, active navigation tabs, and primary actions so Viewer read-only and E-Stop lockouts strip green across the entire UI.
- **Do** apply `JetBrains Mono` with `tabular-nums` on every sensor metric, delta, wattage, PWM preset, threshold pin, and timestamp.
- **Do** structure interior card content with `1px` `#EFECE4` hairline dividers and `#FAF9F6` wells inside `18px` white cards instead of nesting bordered cards inside cards.
- **Do** pair every semantic status hue with an explicit Vietnamese label, icon, or numeric measurement for daylight and projector accessibility.
- **Do** preserve `44×44px` minimum mobile touch targets and honest `Chờ dữ liệu...` / empty-state copy whenever sensor history has fewer than two points.

### Don't:
- **Don't** add green `Trong chuẩn` badges or green borders to passive healthy telemetry cards; keep optimal readings neutral and quiet.
- **Don't** repeat live sync timestamps inside dashboard titles or zone headers when the sticky topbar already displays the single-source clock.
- **Don't** rely on external Google Fonts CDNs or remote CSS assets that fail inside the standalone offline `file://` defense bundle.
- **Don't** introduce dark-slate neon themes, heavy pure-black shadows, or single-click AI hardware actuation bypassing `SafeConfirmModal`.
