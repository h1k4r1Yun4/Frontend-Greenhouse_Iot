# Hướng dẫn Kết nối Backend & Tích hợp Trợ lý AI

Giao diện **Smart Greenhouse IoT** sử dụng kiến trúc **Adapter / Factory** để chuyển đổi giữa chế độ giả lập ngoại tuyến (`mock`) và hệ thống **Backend + MQTT + AI thực tế** mà không phải sửa code UI.

---

## 1. Cách chuyển đổi chế độ kết nối

Bạn có thể cấu hình theo **1 trong 2 cách**:

### Cách A — Trực tiếp trên giao diện (Nhanh khi demo / test)
1. Bấm vào mũi tên bên cạnh badge trạng thái **`Hệ thống: Trực tuyến`** trên thanh tiêu đề (hoặc bấm **`Cấu hình AI`** ở trang **Trợ lý AI Gemini**).
2. Chọn tab **`Kết nối Backend (REST & WebSocket)`** hoặc **`Trợ lý AI (Proxy / Gemini API)`**.
3. Nhập URL máy chủ của bạn, bấm **`Kiểm tra kết nối`** (`GET /health`) rồi bấm **`Lưu Cấu Hình`**.

### Cách B — Qua biến môi trường `.env` khi build / chạy Vite
Sao chép `frontend/.env.example` thành `frontend/.env` và điền các giá trị:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000/ws/greenhouse

VITE_AI_MODE=backend-proxy
VITE_AI_ENDPOINT=/ai/chat
VITE_GEMINI_MODEL=gemini-2.5-flash
```

> **Bảo mật API Key:** Ở môi trường sản xuất, luôn dùng `VITE_AI_MODE=backend-proxy` để `GEMINI_API_KEY` nằm trên Backend Node.js/Python và không bao giờ bị lộ trong bundle trình duyệt. Chế độ `gemini-direct` chỉ lưu key tạm trong `sessionStorage` của phiên làm việc hiện tại để thử nghiệm nhanh.

---

## 2. Hợp đồng REST API cho Backend (`HttpApiClient`)

Code nguồn tại `frontend/src/services/api/httpApiClient.ts` giao tiếp với Backend qua các endpoint chuẩn sau (có gửi kèm header `Authorization: Bearer <token>` nếu được cấu hình):

| Nhóm | Method & Path | Request Body / Query | Response JSON mong đợi |
|---|---|---|---|
| **Health** | `GET /health` | — | `{"status":"ok"}` |
| **Zones** | `GET /zones` | — | `ZoneData[]` (2 khu vực + `history`) |
| **Zone detail** | `GET /zones/:id` | — | `ZoneData \| null` |
| **Gateway** | `GET /gateway` | — | `GatewayData` (`lightIntensity`, `history?`, `status`) |
| **Actuators** | `GET /actuators` | — | `ActuatorState[]` |
| **Điều khiển** | `POST /actuators/:id/command` | `{"action":"ON"\|"OFF","powerLevel"?:number}` | `ActuatorState` đã cập nhật |
| **PWM** | `PATCH /actuators/:id/power` | `{"powerLevel":0..100}` | `ActuatorState` đã cập nhật |
| **E-Stop** | `POST /system/emergency-stop` | — | `200 OK` hoặc `204` |
| **Re-arm** | `POST /system/rearm` | — | `200 OK` hoặc `204` |
| **Tiết kiệm pin** | `PUT /system/telemetry-interval` | `{"intervalSeconds":1..60}` | `{"intervalSeconds":number}` |
| **Automation** | `GET /rules` | — | `AutomationRule[]` |
| **Tạo quy tắc** | `POST /rules` | `Omit<AutomationRule,'id'>` | `AutomationRule` |
| **Sửa quy tắc** | `PUT /rules/:id` | `AutomationRule` | `AutomationRule` |
| **Bật/tắt quy tắc** | `PATCH /rules/:id/toggle` | — | `AutomationRule` |
| **Xóa quy tắc** | `DELETE /rules/:id` | — | `{"deleted":true}` |
| **Alerts** | `GET /alerts` | — | `AlertItem[]` |
| **Đã xem** | `PATCH /alerts/:id/acknowledge` | — | `AlertItem` |
| **Đã khắc phục** | `PATCH /alerts/:id/resolve` | — | `AlertItem` |
| **Lịch sử** | `GET /history?zoneId=zone1&range=24h` | `zoneId`, `range` (`1h\|24h\|7d`) | `HistoryDataPoint[]` |

---

## 3. Hợp đồng WebSocket Telemetry (`WsTelemetryStream`)

Code nguồn tại `frontend/src/services/api/wsTelemetryStream.ts` tự động kết nối tới `VITE_WS_URL` (có cơ chế tự kết nối lại với exponential backoff 1s → 15s). Mỗi gói tin JSON đẩy xuống trình duyệt theo định dạng `TelemetryEvent`:

```json
{
  "zones": [
    {
      "zoneId": "zone1",
      "zoneName": "Khu vực 1 (Node 1 - ESP8266)",
      "cropType": "tomato",
      "nodeId": "ESP8266_NODE_1",
      "status": "online",
      "current": { "temperature": 25.4, "humidity": 68.2, "soilMoisture": 71.0, "timestamp": "..." },
      "history": []
    }
  ],
  "gateway": {
    "gatewayId": "ESP32_GATEWAY",
    "status": "online",
    "lightIntensity": 640,
    "history": [580, 610, 640],
    "timestamp": "..."
  },
  "actuators": [],
  "alerts": [],
  "isEmergencyHalted": false,
  "telemetryIntervalSeconds": 5
}
```

---

## 4. Hợp đồng Tích hợp AI Assistant (`BackendProxyAiAdapter`)

Code nguồn tại `frontend/src/services/ai/backendProxyAiAdapter.ts` gửi `POST` tới `${apiBaseUrl}${aiEndpoint}` (mặc định `POST /api/ai/chat`) kèm đầy đủ ngữ cảnh cảm biến trực tiếp để Backend AI phân tích:

### Request Payload gửi từ Frontend
```json
{
  "message": "Nhiệt độ đang cao, tôi có nên bật quạt thông gió?",
  "cropContext": "tomato",
  "zoneContext": "zone1",
  "telemetry": {
    "zones": [],
    "gateway": {},
    "actuators": []
  },
  "history": [
    { "sender": "user", "text": "..." },
    { "sender": "assistant", "text": "..." }
  ]
}
```

### Response JSON từ Backend AI
Backend trả về nội dung trả lời Markdown kèm (tùy chọn) `proposedAction`. Khi có `proposedAction`, giao diện tự động render **`ActionProposalCard`** và bắt buộc người dùng xác nhận qua **`SafeConfirmModal`** trước khi gọi `POST /actuators/:id/command`:

```json
{
  "text": "**Đánh giá Vi khí hậu:** Nhiệt độ tại Khu 1 là **31.2°C**, vượt ngưỡng tối ưu.\n\nĐề xuất bật quạt thông gió ở mức 85%.",
  "proposedAction": {
    "actuatorId": "ventilation_fan",
    "targetZone": "zone1",
    "action": "ON",
    "powerLevel": 85,
    "reason": "Nhiệt độ vượt ngưỡng 28°C của cây Cà chua."
  }
}
```

> Frontend tự động chuẩn hóa và kiểm tra hợp lệ `actuatorId` (`water_pump | mist_spray | ventilation_fan | grow_light`), `targetZone` (`zone1 | zone2 | all`) và `action` (`ON | OFF | SET_POWER`), đồng thời chặn thực thi nếu người dùng đang ở vai trò **Viewer** hoặc hệ thống đang **EMERGENCY HALTED**.
