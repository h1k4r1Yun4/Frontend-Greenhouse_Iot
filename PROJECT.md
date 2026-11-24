# Project: Smart Greenhouse IoT Frontend

> **Phase 3 Redesign & Integration Note:** Visual design tokens and UI specifications have moved to [`DESIGN.md`](./DESIGN.md) (Warm Action-First Surface), product scope lives in [`PRODUCT.md`](./PRODUCT.md), and the live Backend REST/WebSocket + AI integration contract lives in [`BACKEND_AI_INTEGRATION.md`](./BACKEND_AI_INTEGRATION.md).

## Architecture
Hệ thống Frontend Nhà kính thông minh IoT được xây dựng trên nền tảng **React 18/19**, **Vite** và **Tailwind CSS**. Ứng dụng hoạt động theo kiến trúc module hóa phân tầng (Layered Component Architecture) kết hợp với Mock API Service & Real-time Event Simulator:

```
[UI Views: Dashboard | Controls | Automation | Alerts | History | Chatbot]
                                    │
                                    ▼
       [Application State & Real-time Context (GreenhouseContext)]
                                    │
                                    ▼
         [API Client Layer / Adapter (IApiClient Interface)]
                   ┌────────────────┴────────────────┐
                   ▼                                 ▼
         [MockApiClient / EventBus]        [Real Backend API (Future)]
      (Telemetry Simulator, Hysteresis,
       MQTT/REST Mock, Diurnal Cycles)
```

- **Data Flow**: Mock API Service tạo dữ liệu đo lường cảm biến theo chu kỳ 5 giây mô phỏng điều kiện thực tế (chu kỳ ngày/đêm, biến động độ ẩm đất khi tưới, tác động của quạt và phun sương). Context Provider phát tán state đồng bộ đến tất cả các màn hình giao diện.
- **Actuator Control Flow**: Khi người dùng hoặc AI Chatbot kích hoạt bật/tắt thiết bị, lệnh được xác thực qua Human-in-the-Loop Safety Confirmation Dialog trước khi gửi tới API client. Trạng thái thiết bị phản hồi ngay lập tức trên UI và cập nhật mô phỏng cảm biến vật lý tương ứng.

## Production Redesign Architecture & Design System (Phase 2)
Theo yêu cầu thiết kế sản xuất (Production-Ready Redesign), giao diện được chuẩn hóa toàn diện:
1. **Bảng màu & Tokens Nông nghiệp Công nghệ cao (Cyber Agritech)**:
   - Màu thực vật chủ đạo: Deep Botanical Emeralds (`#059669`, `#10b981`), Mint Foliage (`#34d399`), Chloroplast Dark (`#064e3b`).
   - Màu cảm biến môi trường: Độ ẩm & sương mù (Cyan/Sky `#0ea5e9`), Độ ẩm đất (Deep Teal `#14b8a6`), Nhiệt độ & bức xạ (Coral/Amber `#f97316`), Quang thông LDR Lux (Solar Gold `#f59e0b`), Trợ lý AI Gemini (Electric Indigo `#6366f1`).
   - Hiệu ứng thị giác: Lớp phủ kính mờ `.agri-glass`, `.agri-glass-dark`, viền phát sáng `.glow-emerald`, `.glow-rose`, hoa văn sọc chéo cảnh báo công nghiệp.
2. **Bố cục Responsive 3 Cấp độ**:
   - **Desktop (>1024px)**: Sidebar mở rộng 256px (`w-64`) hoặc thu gọn thành Icon Rail 72px (`w-20`), Header với badge kết nối đa thực thể mở popover chi tiết, lưới hiển thị đa cột rộng rãi.
   - **Tablet (640px - 1024px)**: Sidebar tự động chuyển chế độ Icon Rail 72px hoặc Off-canvas Drawer, bố cục 2 cột linh hoạt không bị kéo dãn thanh điều hướng.
   - **Mobile (<640px)**: Header thu gọn chống tràn ngang (<360px fit), nút Menu Hamburger mở Mobile Drawer toàn diện, thanh Bottom Navigation tinh chỉnh tối ưu cảm ứng (44px hit-targets).
3. **Trực quan hóa Dải trễ (Hysteresis Visualizer)**: Thước đo 3 phân vùng (Kích hoạt - Dải trễ giữ trạng thái chống rung relay - Vùng an toàn ngắt) kèm con trỏ giá trị thực tế thời gian thực.
4. **Mini-Charts & Sparklines**: Pure SVG Sparkline đường cong Bézier siêu nhẹ tích hợp chỉ số biến thiên delta (+/-) và status badges 3 mức độ (Tối ưu / Cận ngưỡng / Vượt chuẩn).
5. **Cụm Dừng khẩn cấp Chuẩn Công nghiệp**: Phím nấm 3D tactile đỏ rực trên nền hazard stripes + banner cờ trạng thái "EMERGENCY HALTED" kèm nút khôi phục (Re-arm).
6. **Biểu đồ Đa trục Recharts Trau chuốt**: Hỗ trợ so sánh đồng thời Nhiệt độ (°C), Độ ẩm không khí (%), Độ ẩm đất (%) và Cường độ ánh sáng (Lux) với bộ lọc chuyển đổi linh hoạt.
7. **Quy trình An toàn 2 Bước AI Chatbot**: Agro-context selector xem nhanh thông số cây trồng + Safe Confirmation Modal 3 giai đoạn (Đề xuất AI -> Phê duyệt Con người -> Phát lệnh MQTT).

## Feature Inventory
Tất cả các tính năng từ giai đoạn khảo sát được phân bổ đầy đủ vào các cột mốc thực thi:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | WBS & Agent Assignment | Phân rã công việc chi tiết cho các agent frontend | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Project Scaffolding | Khởi tạo dự án React + Vite + Tailwind CSS | M2 | ORIGINAL_REQUEST §R2 |
| 3 | Data Contracts & Types | Khai báo toàn bộ TypeScript interfaces | M2 | Survey 2 & 3 |
| 4 | Mock API Service & Simulator | Mock API engine telemetry cho 2 khu vực + LDR gateway | M2 | ORIGINAL_REQUEST §R4 |
| 5 | App Shell & Navigation (Initial) | Thanh Header/Navbar và sidebar cơ bản | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Dashboard Screen (Initial) | Hiển thị thông số 2 node + LDR gateway | M3 | ORIGINAL_REQUEST §R2 |
| 7 | Controls Screen (Initial) | Bảng điều khiển chuyển mạch bật/tắt thiết bị | M3 | ORIGINAL_REQUEST §R2 |
| 8 | Automation Screen (Initial) | Giao diện cấu hình quy tắc tự động hóa | M3 | ORIGINAL_REQUEST §R2 |
| 9 | Alerts Screen (Initial) | Danh sách cảnh báo và lọc theo mức độ | M3 | ORIGINAL_REQUEST §R2 |
| 10 | History Screen (Initial) | Biểu đồ Recharts chuỗi thời gian 2 trục Y | M3 | ORIGINAL_REQUEST §R2 |
| 11 | AI Chatbot Interface (Initial) | Khung chat tương tác với Google Gemini | M4 | ORIGINAL_REQUEST §R3 |
| 12 | Crop & Zone Selector (Initial) | Dropdown chọn loại cây trồng hoặc khu vực | M4 | ORIGINAL_REQUEST §R3 |
| 13 | Safety Confirmation Dialog (Initial) | Hộp thoại xác nhận an toàn trước khi gửi lệnh | M4 | ORIGINAL_REQUEST §R3 |
| 14 | Automated Test Suite (Initial) | Bộ kiểm thử tự động 9 test files / 34 tests | M5 | ORIGINAL_REQUEST §AC |
| 15 | Verification & Build Gate (Initial) | Kiểm toán toàn vẹn và kiểm tra build phase 1 | M5 | Acceptance Criteria |
| 16 | Production Design System & App Shell Redesign | Tokens agritech, glassmorphism, responsive 3 viewports, collapsible rail, mobile drawer, multi-entity connection status popover | R-M1 | Redesign Request §R1 |
| 17 | Dashboard Sparklines & Zone Redesign | Pure SVG MiniSparklines, delta trend, status badges, zone history data flow, LDR solar rhythm | R-M2 | Redesign Request §R2 |
| 18 | Actuator Controls & Industrial E-Stop Redesign | Tactile toggle, PWM 0-100% + quick presets (25-100%), industrial mushroom E-Stop + EMERGENCY HALTED state latch & re-arm | R-M2 | Redesign Request §R3 |
| 19 | Automation Hysteresis Visualizer Redesign | Thước đo 3 phân vùng dải trễ chống rung relay + live cursor, live preview modal, full Edit rule CRUD | R-M3 | Redesign Request §R4 |
| 20 | Alerts KPI Center Redesign | Thẻ thống kê chỉ số khẩn cấp (Critical/Warning/Info counters), pulsing indicators, smooth interactions | R-M3 | Redesign Request §R5 |
| 21 | History Multi-Axis Recharts & Lux Redesign | Biểu đồ Recharts hỗ trợ Lux, bộ chọn metric toggle, custom tooltip trau chuốt, CSV export | R-M3 | Redesign Request §R5 |
| 22 | AI Chatbot & 2-Step Safe Confirmation Redesign | Agro-context preview chip, rich markdown chat, 3-stage Safe Confirmation Modal (AI -> Human -> MQTT) | R-M4 | Redesign Request §R6 |
| 23 | Comprehensive Production Verification & QA | Kiểm tra 100% test cases pass, build production sạch, forensic audit & review đa góc độ | R-M4 | Redesign Request §AC |

## Milestones
| # | Name | Scope | Dependencies | Status | Key Outputs |
|---|------|-------|-------------|--------|-------------|
| M1 | WBS & Agent Assignment | Phân công công việc ban đầu | None | DONE | `WBS_AGENT_ASSIGNMENT.md` |
| M2 | Initial Frontend Scaffold | Khởi tạo dự án, types, mock simulator | M1 | DONE | `frontend/package.json`, `types/` |
| M3 | Initial Core UI Screens | 5 màn hình cơ sở | M2 | DONE | Core page components |
| M4 | Initial AI Chatbot | Chatbot và safe confirm modal cơ sở | M3 | DONE | `ChatbotPage.tsx` |
| M5 | Initial Test Suite & Audit | 34/34 tests, audit pass | M4 | DONE | 9 test files |
| R-M1 | Production Design System, Theme Tokens & App Shell | Bảng màu agritech, CSS glassmorphism, Sidebar collapsible rail + mobile drawer, Header multi-entity status popover, responsive 3 viewports | M5 | DONE | `tailwind.config.js`, `index.css`, `Navbar.tsx`, `Sidebar.tsx`, `ConnectionBadge.tsx`, `App.tsx` |
| R-M2 | Real-Time Dashboard Sparklines & Controls E-Stop | Pure SVG MiniSparkline, delta trends, ZoneCards, LDR Lux rhythm, tactile toggle, PWM 0-100% presets, industrial mushroom E-Stop + Latch banner | R-M1 | DONE | `MiniSparkline.tsx`, `SensorMetricCard.tsx`, `ZoneOverviewCard.tsx`, `GatewayLightCard.tsx`, `MasterControlPanel.tsx`, `ActuatorToggleCard.tsx` |
| R-M3 | Automation Hysteresis Visualizer, Alerts KPI & Multi-Axis History | Thước đo 3 phân vùng Hysteresis, Live Preview trong RuleEditorModal, full Edit CRUD, Alerts KPI counters, Recharts đa trục có Lux, Metric Toggles | R-M2 | DONE | `HysteresisVisualizer.tsx`, `RuleItemCard.tsx`, `RuleEditorModal.tsx`, `AlertListItem.tsx`, `AlertFilterBar.tsx`, `SensorHistoryChart.tsx` |
| R-M4 | AI Chatbot Agro-Context, Safe 2-Step Modal & Multi-Agent Verification | Agro-context preview, 3-stage Safe Modal (AI->Human->MQTT), build & test suite verification (61/61 tests PASS, build 0 errors), Reviewers APPROVE, Challengers APPROVE & Forensic Audit CLEAN | R-M3 | DONE | `CropZoneSelector.tsx`, `ChatWindow.tsx`, `SafeConfirmModal.tsx`, 61/61 tests PASS, Audit CLEAN |

## Interface Contracts

### 1. Telemetry & Sensor Contract (`types/sensor.ts`)
```typescript
export interface SensorReading {
  temperature: number; // DHT11, °C (15 - 45)
  humidity: number;    // DHT11, % RH (20 - 95)
  soilMoisture: number; // Soil sensor, % (0 - 100)
  timestamp: string;   // ISO-8601 string
}

export interface ZoneData {
  zoneId: 'zone1' | 'zone2';
  zoneName: string;
  cropType: 'tomato' | 'lettuce' | 'strawberry' | 'custom';
  nodeId: 'ESP8266_NODE_1' | 'ESP8266_NODE_2';
  status: 'online' | 'offline' | 'warning';
  current: SensorReading;
  history: SensorReading[];
}

export interface GatewayData {
  gatewayId: 'ESP32_GATEWAY';
  status: 'online' | 'offline';
  lightIntensity: number; // LDR sensor, Lux (0 - 100000)
  timestamp: string;
}
```

### 2. Actuator & Control Contract (`types/actuator.ts`)
```typescript
export type ActuatorType = 'water_pump' | 'mist_spray' | 'ventilation_fan' | 'grow_light';
export type ControlMode = 'manual' | 'auto';

export interface ActuatorState {
  id: ActuatorType;
  name: string;
  targetZone: 'zone1' | 'zone2' | 'all';
  isActive: boolean;
  powerLevel: number; // 0 - 100 (PWM for fan and LED light)
  mode: ControlMode;
  lastUpdated: string;
  driverType: 'relay' | 'pwm';
}

export interface ActuatorCommand {
  actuatorId: ActuatorType;
  action: 'ON' | 'OFF' | 'SET_POWER';
  powerLevel?: number;
  initiatedBy: 'user' | 'automation' | 'chatbot';
  confirmedByUser: boolean;
}
```

### 3. Automation Rule Contract (`types/automation.ts`)
```typescript
export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  targetZone: 'zone1' | 'zone2' | 'all';
  sensorType: 'temperature' | 'humidity' | 'soilMoisture' | 'lightIntensity';
  comparison: '>' | '<' | '>=' | '<=';
  threshold: number;
  hysteresis: number;
  actuatorId: ActuatorType;
  actuatorAction: 'ON' | 'OFF';
  powerLevel?: number;
}
```

### 4. Alert Contract (`types/alert.ts`)
```typescript
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertItem {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  zoneId: 'zone1' | 'zone2' | 'gateway' | 'system';
  message: string;
  source: string;
  resolved: boolean;
  acknowledged: boolean;
}
```

### 5. AI Chatbot & Safety Action Proposal Contract (`types/chatbot.ts`)
```typescript
export interface ProposedActuatorAction {
  id: string;
  actuatorId: ActuatorType;
  actuatorName: string;
  targetZone: 'zone1' | 'zone2' | 'all';
  action: 'ON' | 'OFF' | 'SET_POWER';
  powerLevel?: number;
  reason: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  cropContext?: string;
  zoneContext?: 'zone1' | 'zone2';
  proposedAction?: ProposedActuatorAction;
}
```

## Code Layout
```
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vitest.config.ts
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   ├── sensor.ts
│   │   ├── actuator.ts
│   │   ├── automation.ts
│   │   ├── alert.ts
│   │   ├── chatbot.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── crops.ts
│   │   └── defaultRules.ts
│   ├── services/
│   │   ├── api/
│   │   │   ├── apiClient.interface.ts
│   │   │   ├── mockApiClient.ts
│   │   │   ├── mockSimulator.ts
│   │   │   └── index.ts
│   │   └── geminiService.ts
│   ├── context/
│   │   └── GreenhouseContext.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ConnectionBadge.tsx
│   │   ├── common/
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Badge.tsx
│   │   ├── dashboard/
│   │   │   ├── MiniSparkline.tsx           <-- [NEW] Pure SVG sparkline with Bézier curve & gradient
│   │   │   ├── SensorMetricCard.tsx        <-- [REDESIGNED] With sparklines, deltas & status badges
│   │   │   ├── ZoneOverviewCard.tsx        <-- [REDESIGNED] With telemetry history & plant health
│   │   │   └── GatewayLightCard.tsx        <-- [REDESIGNED] Solar rhythm waves & DLI metrics
│   │   ├── controls/
│   │   │   ├── MasterControlPanel.tsx      <-- [REDESIGNED] Industrial mushroom E-Stop + Latch banner
│   │   │   └── ActuatorToggleCard.tsx      <-- [REDESIGNED] Tactile toggle, PWM 0-100%, 25-100% presets
│   │   ├── automation/
│   │   │   ├── HysteresisVisualizer.tsx    <-- [NEW] 3-band visualizer bar with live pin & tooltips
│   │   │   ├── RuleItemCard.tsx            <-- [REDESIGNED] With HysteresisVisualizer & Edit button
│   │   │   └── RuleEditorModal.tsx         <-- [REDESIGNED] With Live Preview & Edit rule support
│   │   ├── alerts/
│   │   │   ├── AlertListItem.tsx           <-- [REDESIGNED] Accent stripes, pulsing critical markers
│   │   │   └── AlertFilterBar.tsx          <-- [REDESIGNED] KPI counters (Critical, Warning, Info)
│   │   ├── history/
│   │   │   └── SensorHistoryChart.tsx      <-- [REDESIGNED] Multi-axis with Lux, Metric toggles, tooltips
│   │   └── chatbot/
│   │       ├── ChatWindow.tsx              <-- [REDESIGNED] Rich markdown, quick action chips
│   │       ├── CropZoneSelector.tsx        <-- [REDESIGNED] Context selector with live telemetry chip
│   │       ├── ChatMessageItem.tsx         <-- [REDESIGNED] Visual chat flow
│   │       ├── ActionProposalCard.tsx      <-- [REDESIGNED] Hardware actuation proposal styling
│   │       └── SafeConfirmModal.tsx        <-- [REDESIGNED] 3-stage Human-in-the-Loop Safe Modal
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── ControlsPage.tsx
│   │   ├── AutomationPage.tsx
│   │   ├── AlertsPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── ChatbotPage.tsx
│   └── tests/
│       ├── setup.ts
│       ├── App.test.tsx
│       ├── DashboardPage.test.tsx
│       ├── ControlsPage.test.tsx
│       ├── AutomationPage.test.tsx
│       ├── AlertsPage.test.tsx
│       ├── HistoryPage.test.tsx
│       ├── ChatbotSafeConfirm.test.tsx
│       ├── AdversarialVerification.test.tsx
│       └── EmpiricalStress.test.tsx
```
