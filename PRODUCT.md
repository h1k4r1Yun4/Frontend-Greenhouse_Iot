# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary audience 1 — Capstone defense evaluators & presenters (Giảng viên & sinh viên bảo vệ đồ án cuối kỳ):** Inspect and demonstrate the Smart Greenhouse IoT platform on laptops and lecture-hall projectors (often running the standalone single-file HTML bundle `Giao_dien_Nha_kinh_IoT.html` offline as well as `vite` dev server). They evaluate live telemetry clarity, engineering rigor, hysteresis control behavior, RBAC enforcement, E-Stop safety latching, and 2-step AI safety confirmation.
- **Primary audience 2 — Greenhouse operators & technicians (Kỹ thuật viên / chủ nhà kính):** Monitor daily microclimate conditions and actuate equipment across desktop monitors, tablets, and mobile phones (360px+ width) inside bright greenhouse environments.
- **Roles supported:** `admin` (full control & configuration), `operator` (device control, rules, alerts), `viewer` (strictly read-only across all screens, including AI chatbot proposals).

## Product Purpose

Provide a reliable, real-time monitoring, hysteresis-protected automation, and Human-in-the-Loop AI agronomy control interface for a 2-zone Smart Greenhouse IoT system. Success means:
- Zero functional, safety, layout, CSS, or runtime bugs across desktop, tablet, and mobile.
- Immediate legibility of both zones' microclimate status, light intensity, actuator states, and active alerts—both on a projector across a classroom and on a phone in daylight.
- Verifiable engineering safety invariants (strict Viewer read-only RBAC, global E-Stop interlock across screens, accurate hysteresis logic, mandatory 2-step human approval before any AI-proposed hardware actuation).

## Positioning

Combines multi-node microclimate telemetry (2 ESP8266 crop zones + 1 ESP32 LDR light & actuator gateway) with transparent 3-band hysteresis visualization and a strictly gated Human-in-the-Loop Gemini agronomy assistant that never actuates hardware silently.

## Operating Context

- Dual delivery context: React + TypeScript + Vite web application (`frontend/`) AND synchronized single-file standalone bundle (`Giao_dien_Nha_kinh_IoT.html` built via `vite-plugin-singlefile`) that must remain fully usable offline during academic defense.
- Hardware topology represented in the capstone report (`ELT3244_1_Nhom3_BCCki.pdf`):
  - `ESP8266_NODE_1` — Zone 1 (`Khu vực 1`): Tomato (`Cà chua`), DHT11 temperature & humidity + soil moisture sensor.
  - `ESP8266_NODE_2` — Zone 2 (`Khu vực 2`): Lettuce (`Rau xà lách`), DHT11 temperature & humidity + soil moisture sensor.
  - `ESP32_GATEWAY` — Central Light & Actuator Hub: LDR light intensity (Lux) + 4 actuators (`water_pump` relay, `mist_spray` relay, `ventilation_fan` PWM 0–100%, `grow_light` PWM 0–100%).
- Driven by `IApiClient` + 5-second configurable `mockSimulator` ready to swap to a Node.js + MQTT + SQLite + Gemini backend.

## Capabilities and Constraints

- **Must preserve all 6 screens & report features:**
  1. Dashboard (Zone 1 & Zone 2 live readings + trend sparklines + biological health, ESP32 Gateway Lux + DLI, quick 4-actuator status, recent alerts).
  2. Controls (Master control panel + industrial E-Stop with global `EMERGENCY HALTED` interlock & Re-arm, battery-saving telemetry interval configuration that genuinely updates simulator & header interval, zone filters, 4 actuator switches + PWM slider & 25/50/75/100% presets).
  3. Automation (Hysteresis rule CRUD, live 3-band Hysteresis Visualizer without overlapping labels, toggle/edit/delete respecting RBAC).
  4. Alerts (Critical/Warning/Info/Resolution-rate KPIs, severity & zone filters, show-resolved toggle, acknowledge & resolve actions).
  5. History (Recharts multi-axis chart with temperature, air humidity, soil moisture, light Lux; `1 Giờ` / `24 Giờ` / `7 Ngày` ranges; chart & data table toggle; CSV export without Blob URL leak).
  6. AI Chatbot (Crop & zone context selector with accurate live telemetry summary, Markdown-formatted responses, quick prompt chips, 2-step `ActionProposalCard` → `SafeConfirmModal` Human-in-the-Loop pipeline enforcing Viewer RBAC).
- **Must fix 5 known logic/safety bugs & update corresponding tests:**
  1. Viewer RBAC bypass in AI Chatbot (`viewer` must be blocked from confirming/executing hardware actions).
  2. Global E-Stop interlock (persists across tabs in `GreenhouseContext` and disables actuator actuation until Re-arm).
  3. Simulator PWM `0%` falsy `||` bug (use `??` so 0% means 0%).
  4. Simulator hysteresis turn-off branches for `<=` and `>=`.
  5. Simulator rule `actuatorAction: 'OFF'` support (and Gemini command priority so `"tắt quạt"` / `"dừng bơm"` triggers OFF).
- **Pluggable Backend & AI Extensibility:**
  - Provide clean, swappable **Backend API (`IApiClient` + `HttpApiClient` + `WsTelemetryStream`)** and **Pluggable AI Service (`IAiAssistantService` + `MockAiAdapter` / `BackendProxyAiAdapter` / `GeminiDirectAiAdapter`)** configurable via `.env` or an in-app Developer/Integration settings modal, defaulting safely to `mock` for offline demo and automated tests.
- **Language:** Vietnamese UI throughout (preserve domain terminology and test-verified accessibility labels where appropriate).
- **Offline resilience:** Must render cleanly without external network dependency when `Giao_dien_Nha_kinh_IoT.html` is opened directly via `file://`.

## Evidence on Hand

- Existing React/TypeScript codebase in `frontend/src/` with 11 Vitest suites (61 passing tests).
- Architecture & data contracts in `PROJECT.md` and `README.md`.
- Academic capstone report `ELT3244_1_Nhom3_BCCki.pdf` (controls power-saving interval, chart & table views).
- Real hardware backend/MQTT broker is not connected in local development; all sensor telemetry and Gemini responses run via `mockSimulator` and `geminiService` mocks (must not fabricate live MQTT production claims beyond simulator/mock context).

## Product Principles

1. **Safety & truth before ornament:** Hardware states, E-Stop lockouts, offline status, and RBAC restrictions must be unmistakable, synchronized across every view, and never faked.
2. **Instant cross-room and daylight legibility:** Every sensor reading, biological range status, and active alert must scan cleanly on both a lecture projector and a 360px phone screen.
3. **Calm operational precision:** Motion exists only to convey real state changes or hardware activity—never gratuitous pulsing, bouncing, or decorative noise.
4. **Complete, bug-free craft:** Every interactive control supports full states (default, hover, focus, active, disabled, empty, error) using valid Tailwind v3 utilities and zero overlapping/clipped elements.

## Accessibility & Inclusion

- Minimum 4.5:1 text contrast on all surfaces and >=3:1 for icons/controls (critical for bright lecture projectors and outdoor greenhouse daylight).
- Minimum 44x44px touch targets on mobile navigation and primary controls.
- Keyboard navigable controls, visible focus rings, `aria-label` on icon buttons, `aria-modal` and Escape-to-close on dialogs, and `prefers-reduced-motion` support.
- Color is never the sole status indicator (pair color with explicit text labels/icons and distinct chart line styles).