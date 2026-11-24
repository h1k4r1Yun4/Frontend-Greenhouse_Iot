# Smart Greenhouse IoT System

An end-to-end **Smart Greenhouse IoT** monitoring, automation, and AI-assisted control platform built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**, designed to integrate with **ESP8266/ESP32** hardware nodes, an **MQTT** broker, a **Node.js** backend, and **Google Gemini** with mandatory **Human-in-the-Loop** safety confirmation.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Hardware & Sensor Nodes](#hardware--sensor-nodes)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started (Frontend)](#getting-started-frontend)
- [Backend & Hardware Integration Guide](#backend--hardware-integration-guide)
- [Testing & Build](#testing--build)
- [Documentation](#documentation)

---

## Overview

The system monitors microclimate conditions across two cultivation zones and a central light gateway, automates actuators using threshold + hysteresis rules, and provides an AI Agronomy Assistant that proposes hardware actions without ever actuating devices autonomously.

- **Current Repository State**: The `frontend/` application is complete and production-ready, powered by an `IApiClient` abstraction and a 5-second real-time `mockSimulator` (with diurnal temperature/humidity cycles, soil moisture depletion, and actuator feedback).
- **Integration Target**: Designed to connect seamlessly to a **Node.js (TypeScript) + MQTT + SQLite + Gemini API** backend (or Node-RED middleware) by implementing `IApiClient` and streaming telemetry over WebSockets.

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                          │
│  Dashboard │ Controls │ Automation │ Alerts │ History │ AI Chatbot      │
│                          GreenhouseContext                              │
│                       IApiClient + WebSocket                            │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ REST API + WebSocket (/ws/greenhouse)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     BACKEND ORCHESTRATOR (Node.js)                      │
│  • REST API & WebSocket Server     • Automation & Hysteresis Engine     │
│  • Gemini AI Proxy (API Key safe)  • SQLite / Time-Series History DB    │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │ MQTT Publish / Subscribe        │ HTTPS
                    ▼                                 ▼
         ┌─────────────────────┐             ┌─────────────────┐
         │     MQTT Broker     │             │  Google Gemini  │
         │     (Mosquitto)     │             │       API       │
         └──────────┬──────────┘             └─────────────────┘
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
[ESP8266 Node 1] [ESP8266 Node 2] [ESP32 Gateway]
 Zone 1: Tomato   Zone 2: Lettuce  LDR Light Sensor
 DHT11 + Soil     DHT11 + Soil     4 Actuators (Relay & PWM)
```

> **Development Mode (Current):** `GreenhouseContext` binds to `mockApiClient` and `mockSimulator` inside `frontend/src/services/api/`, enabling full UI testing and verification without physical hardware attached.

---

## Key Features

1. **Real-Time Telemetry Dashboard**
   - Live metrics for **Zone 1** (Tomato), **Zone 2** (Lettuce), and **ESP32 Gateway** (LDR Lux).
   - Pure SVG Bézier sparklines, delta trend indicators, and optimal/warning/critical status badges.
2. **Actuator Controls & Industrial E-Stop**
   - Controls for 4 actuators: **Water Pump** (`relay`), **Mist Spray** (`relay`), **Ventilation Fan** (`pwm` 0–100%), and **Grow Light** (`pwm` 0–100%).
   - Tactile industrial **Emergency Stop (E-Stop)** mushroom button with an `EMERGENCY HALTED` latch banner and manual **Re-arm System** recovery.
3. **Hysteresis-Based Automation**
   - Full CRUD rule editor with live 3-band **Hysteresis Visualizer** (Trigger Zone, Deadband/Latch Zone, Safe Reset Zone) to prevent relay chattering.
4. **Alerts Center & Multi-Axis History**
   - Severity KPI counters (`critical`, `warning`, `info`), zone filters, acknowledge/resolve workflows.
   - Interactive **Recharts** multi-axis history (`1h`, `24h`, `7d`) covering temperature, air humidity, soil moisture, and light intensity (Lux), with CSV export.
5. **AI Agronomy Chatbot & 2-Step Safety Gate**
   - Crop-aware context selector (`Tomato`, `Lettuce`, `Strawberry`, `Melon`, `Custom`) with live telemetry chips.
   - **Human-in-the-Loop Safety Flow**: AI proposals render as an `ActionProposalCard` and require explicit approval inside a 3-stage `SafeConfirmModal` (AI Proposal → Human Verification → Hardware Dispatch) before any command is executed.
6. **Responsive Cyber-Agritech UI & RBAC**
   - Desktop sidebar / icon rail, tablet adaptive layout, and mobile drawer + bottom navigation.
   - Role switcher (`Admin`, `Operator`, `Viewer`) and multi-entity connection status badge.

---

## Hardware & Sensor Nodes

| Device ID | Role | Sensors / Actuators |
|---|---|---|
| `ESP8266_NODE_1` | Zone 1 Microclimate Node (Tomato) | DHT11 (Temperature °C, Air Humidity %), Soil Moisture Sensor (%) |
| `ESP8266_NODE_2` | Zone 2 Microclimate Node (Lettuce) | DHT11 (Temperature °C, Air Humidity %), Soil Moisture Sensor (%) |
| `ESP32_GATEWAY` | Light Gateway & Actuator Hub | LDR Light Sensor (Lux) + `water_pump`, `mist_spray`, `ventilation_fan` (PWM), `grow_light` (PWM) |

---

## Tech Stack

- **Frontend**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Lucide React, Recharts
- **Testing**: Vitest, React Testing Library, JSDOM, `@testing-library/user-event`
- **Target Backend & Middleware**: Node.js (Express/Fastify + TypeScript), `ws` (WebSocket), `mqtt`, SQLite, `@google/genai`
- **Hardware & Messaging**: ESP8266, ESP32, Mosquitto MQTT Broker

---

## Project Structure

```text
.
├── PROJECT.md                    # Detailed frontend architecture & data contracts
├── WBS_AGENT_ASSIGNMENT.md       # Work breakdown structure & module ownership
├── README.md                     # Project overview & setup instructions
└── frontend/                     # React + Vite + Tailwind CSS application
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── vitest.config.ts
    └── src/
        ├── App.tsx
        ├── context/
        │   └── GreenhouseContext.tsx
        ├── constants/
        │   ├── crops.ts          # Crop optimal environmental thresholds
        │   └── defaultRules.ts   # Default hysteresis automation rules
        ├── types/                # Shared TypeScript interfaces (sensor, actuator, rule, alert, chatbot)
        ├── services/
        │   ├── api/              # IApiClient interface, mockApiClient, mockSimulator
        │   └── geminiService.ts  # AI assistant service (ready to swap to backend proxy)
        ├── components/           # Modular UI components (dashboard, controls, automation, alerts, history, chatbot)
        ├── pages/                # 6 core pages
        └── tests/                # Automated Vitest test suites
```

---

## Getting Started (Frontend)

### Prerequisites

- **Node.js** `>= 18.x`
- **npm** `>= 9.x`

### Installation & Local Development

```bash
cd frontend
npm install
npm run dev
```

The development server starts on **`http://localhost:3000`** (configured in `frontend/vite.config.ts`).

---

## Backend & Hardware Integration Guide

To connect the Frontend to a real **Node.js + MQTT + Gemini** backend:

1. **Implement `IApiClient`**: Create `frontend/src/services/api/httpApiClient.ts` implementing the interface in `frontend/src/services/api/apiClient.interface.ts` (plus `emergencyStop()`).
2. **Stream Telemetry via WebSocket**: Replace `mockSimulator.subscribe(...)` in `frontend/src/context/GreenhouseContext.tsx` with a WebSocket client listening to `ws://<backend-host>/ws/greenhouse`.
3. **Proxy Gemini Requests**: Update `frontend/src/services/geminiService.ts` to call `POST /api/chat` on the Node.js backend so `GEMINI_API_KEY` stays server-side and never leaks to the browser.
4. **Configure Environment Variables**: Use `.env` flags (e.g., `VITE_USE_MOCK=false`, `VITE_API_BASE_URL`, `VITE_WS_URL`) to switch cleanly between offline mock mode and live hardware mode.

### Expected MQTT Topics (Hardware ↔ Backend)

| Direction | Topic | Payload Example |
|---|---|---|
| Node 1 → Backend | `greenhouse/zone1/telemetry` | `{"nodeId":"ESP8266_NODE_1","temperature":26.4,"humidity":71.2,"soilMoisture":64}` |
| Node 2 → Backend | `greenhouse/zone2/telemetry` | `{"nodeId":"ESP8266_NODE_2","temperature":21.8,"humidity":68.5,"soilMoisture":72}` |
| Gateway → Backend | `greenhouse/gateway/telemetry` | `{"gatewayId":"ESP32_GATEWAY","lightIntensity":840}` |
| Backend → Gateway | `greenhouse/gateway/command` | `{"actuatorId":"ventilation_fan","action":"ON","powerLevel":85}` |

---

## Testing & Build

Run the automated test suite and production build from the `frontend/` directory:

```bash
cd frontend

# Run Vitest unit & component tests
npm test

# Type-check and build production bundle to frontend/dist/
npm run build

# Preview production build locally
npm run preview
```

---

## Documentation

- [DESIGN.md](./DESIGN.md) — Warm Action-First design system, color/typography tokens, component specs, and `.impeccable/design.json` sidecar.
- [BACKEND_AI_INTEGRATION.md](./BACKEND_AI_INTEGRATION.md) — Step-by-step REST (`IApiClient`), WebSocket (`/ws/greenhouse`), and AI proxy (`IAiAssistantService` / Gemini) backend integration guide.
- [PRODUCT.md](./PRODUCT.md) — Product vision, target audiences, functional scope, and non-negotiable safety invariants.
- [PROJECT.md](./PROJECT.md) — Legacy Phase 2 frontend file inventory and TypeScript data contracts.
- [WBS_AGENT_ASSIGNMENT.md](./WBS_AGENT_ASSIGNMENT.md) — Detailed WBS dictionary, data flow, and acceptance criteria.
