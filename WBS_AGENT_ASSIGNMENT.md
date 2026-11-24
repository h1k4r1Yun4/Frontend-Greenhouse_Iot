# TÀI LIỆU PHÂN CHIA CÔNG VIỆC CHO CÁC AGENT CHUYÊN TRÁCH FRONTEND
## Hệ thống Quản lý Nhà kính Thông minh IoT (Smart Greenhouse IoT)

---

## 1. TỔNG QUAN VÀ MỤC TIÊU DỰ ÁN

Dự án xây dựng ứng dụng web Frontend hoàn chỉnh bằng **React 18/19**, **Vite** và **Tailwind CSS** phục vụ giám sát và điều khiển Nhà kính thông minh IoT. Hệ thống nhận dữ liệu đo đạc thực tế từ:
- **Node 1 (ESP8266)**: Đo nhiệt độ DHT11, độ ẩm không khí, độ ẩm đất tại Khu vực 1 (Canh tác Cà chua).
- **Node 2 (ESP8266)**: Đo nhiệt độ DHT11, độ ẩm không khí, độ ẩm đất tại Khu vực 2 (Canh tác Xà lách).
- **Gateway (ESP32)**: Đo cường độ ánh sáng quang trở LDR và điều khiển 4 thiết bị chấp hành (Máy bơm nước, Hệ thống phun sương, Quạt thông gió, Đèn LED chiếu sáng sinh trưởng).

Hệ thống tích hợp trợ lý trí tuệ nhân tạo **Google Gemini** hỗ trợ phân tích môi trường vi khí hậu và đề xuất lệnh điều khiển kèm **hộp thoại xác nhận an toàn bắt buộc (Human-in-the-Loop Safe Confirmation)** trước khi kích hoạt thiết bị.

---

## 2. MA TRẬN PHÂN CÔNG AGENT CHUYÊN TRÁCH (AGENT ASSIGNMENT MATRIX)

Đội ngũ phát triển Frontend được cấu trúc thành **5 Agent chuyên trách**, hoạt động theo ranh giới module rõ ràng để tối ưu hóa hiệu suất và ngăn ngừa xung đột mã nguồn:

| STT | Agent Chuyên trách | Vai trò chính | Trách nhiệm cốt lõi | Các thành phần giao diện / Files phụ trách |
|:---:|:---|:---|:---|:---|
| **1** | **`frontend_lead_architect`** | Kiến trúc sư trưởng & Nền tảng | Thiết lập dự án React + Vite + Tailwind, khai báo TypeScript Contracts, xây dựng Mock API Service & Simulator vi khí hậu 5s, cung cấp App Shell & Context Provider | `package.json`, `vite.config.ts`, `tailwind.config.js`, `src/types/*`, `src/services/api/*`, `src/context/GreenhouseContext.tsx`, `src/components/layout/*`, `src/App.tsx` |
| **2** | **`frontend_core_dashboard`** | Kỹ sư Giao diện Giám sát & Dữ liệu | Xây dựng màn hình Dashboard thời gian thực, biểu đồ chuỗi thời gian History (Recharts) đa trục Y, và màn hình quản lý cảnh báo Alerts | `src/pages/DashboardPage.tsx`, `src/pages/HistoryPage.tsx`, `src/pages/AlertsPage.tsx`, `src/components/dashboard/*`, `src/components/history/*`, `src/components/alerts/*` |
| **3** | **`frontend_controls_automation`** | Kỹ sư Điều khiển & Tự động hóa | Xây dựng bảng điều khiển bật/tắt thiết bị tức thời kèm thanh chỉnh công suất PWM, màn hình thiết lập kịch bản tự động hóa với ngưỡng so sánh và dải trễ (hysteresis) | `src/pages/ControlsPage.tsx`, `src/pages/AutomationPage.tsx`, `src/components/controls/*`, `src/components/automation/*`, `src/constants/defaultRules.ts` |
| **4** | **`frontend_chatbot_security`** | Kỹ sư AI Chatbot & An toàn Điều khiển | Xây dựng giao diện Chatbot Google Gemini, bộ chọn khu vực/cây trồng, thẻ đề xuất hành động và hộp thoại xác nhận 2 bước an toàn (Safe Confirmation Modal) | `src/pages/ChatbotPage.tsx`, `src/components/chatbot/*`, `src/services/geminiService.ts`, `src/constants/crops.ts` |
| **5** | **`frontend_qa_engineer`** | Kỹ sư Đảm bảo Chất lượng & Kiểm thử | Thiết lập Vitest + React Testing Library, phát triển bộ kiểm thử tự động toàn diện kiểm tra render 5 màn hình chính, luồng xác nhận an toàn Chatbot, và build nghiệm thu | `vitest.config.ts`, `src/tests/setup.ts`, `src/tests/*.test.tsx` |

---

## 3. CƠ CẤU PHÂN RÃ CÔNG VIỆC CHI TIẾT (WBS DICTIONARY)

### WBS 1: Nền tảng, Khung ứng dụng & Dịch vụ Vi khí hậu giả lập (`frontend_lead_architect`)
- **1.1. Khởi tạo dự án & Cấu hình Tooling**:
  - Tạo cấu trúc thư mục chuẩn `frontend/`.
  - Cài đặt và cấu hình Vite, React, TypeScript, Tailwind CSS, PostCSS, Lucide React, Recharts.
- **1.2. Khai báo TypeScript Data Contracts**:
  - Định nghĩa kiểu dữ liệu cảm biến `SensorReading`, `ZoneData`, `GatewayData`.
  - Định nghĩa trạng thái thiết bị `ActuatorState`, `ActuatorCommand`.
  - Định nghĩa cấu trúc luật tự động `AutomationRule`, cảnh báo `AlertItem`, tin nhắn AI `ChatMessage`, hành động đề xuất `ProposedActuatorAction`.
- **1.3. Phát triển Mock API Service & Real-time Telemetry Simulator**:
  - Xây dựng `MockApiClient` cung cấp các hàm async: `getZones()`, `getGateway()`, `getActuators()`, `toggleActuator()`, `getRules()`, `updateRule()`, `getAlerts()`, `getHistory()`.
  - Xây dựng `mockSimulator.ts`: chu kỳ phát sóng 5 giây mô phỏng biến thiên nhiệt độ - độ ẩm theo giờ thực tế; phản hồi vật lý khi bơm bật (độ ẩm đất tăng dần), khi quạt bật (nhiệt độ giảm dần).
- **1.4. Xây dựng State Management & App Shell Layout**:
  - Tạo `GreenhouseContext.tsx` quản lý state tập trung cho toàn bộ ứng dụng.
  - Xây dựng thanh Header với `ConnectionBadge` (Online/Offline indicator), bộ chuyển vai trò người dùng (Admin/Operator/Viewer) và Sidebar điều hướng nhanh.

### WBS 2: Module Giám sát Thời gian thực, Lịch sử & Cảnh báo (`frontend_core_dashboard`)
- **2.1. Màn hình Dashboard (Tổng quan Giám sát)**:
  - Hiển thị card thông số Khu 1 (Node 1 ESP8266 - Cà chua): Nhiệt độ (°C), Độ ẩm không khí (%), Độ ẩm đất (%).
  - Hiển thị card thông số Khu 2 (Node 2 ESP8266 - Xà lách): Nhiệt độ (°C), Độ ẩm không khí (%), Độ ẩm đất (%).
  - Hiển thị card Gateway ESP32: Cường độ ánh sáng quang trở LDR (Lux) và trạng thái kết nối trạm.
  - Hiển thị thanh trạng thái nhanh của 4 thiết bị chấp hành và danh sách 3 cảnh báo mới nhất.
- **2.2. Màn hình History (Biểu đồ Phân tích Lịch sử)**:
  - Tích hợp biểu đồ Recharts tương tác: cho phép chọn xem theo Khu vực 1, Khu vực 2 hoặc Gateway.
  - Cho phép chọn mốc thời gian: 1 Giờ (1h), 24 Giờ (24h), 7 Ngày (7d).
  - Hỗ trợ hiển thị 2 trục Y độc lập (Trục trái: Nhiệt độ °C, Trục phải: Độ ẩm / Ánh sáng %).
  - Đường tham chiếu (Reference Lines) hiển thị ngưỡng tối ưu sinh học cho cây trồng tương ứng.
  - Bảng thống kê tóm tắt (Min, Max, Trung bình) và nút xuất dữ liệu CSV.
- **2.3. Màn hình Alerts (Quản lý Cảnh báo Hệ thống)**:
  - Hiển thị danh sách cảnh báo phân cấp theo mức độ: Nguy hiểm (Critical - đỏ), Cảnh báo (Warning - vàng), Thông tin (Info - xanh).
  - Bộ lọc cảnh báo theo Khu vực (Khu 1, Khu 2, Gateway, Toàn hệ thống) và theo trạng thái (Chưa xử lý / Đã xử lý).
  - Thao tác xử lý nhanh: Nút "Xác nhận đã đọc" và "Khắc phục sự cố" (điều hướng nhanh sang bảng điều khiển).

### WBS 3: Module Điều khiển Thiết bị & Tự động hóa (`frontend_controls_automation`)
- **3.1. Màn hình Controls (Điều khiển Thiết bị Thủ công)**:
  - Bảng điều khiển 4 thiết bị chấp hành:
    1. Máy bơm tưới nước (Water Pump - Relay kích hoạt tưới nhỏ giọt).
    2. Hệ thống phun sương (Mist Spray - Bộ tạo ẩm siêu âm).
    3. Quạt thông gió (Ventilation Fan - Động cơ điều khiển tốc độ PWM).
    4. Đèn chiếu sáng LED (Grow Light - Điều chỉnh độ sáng PWM).
  - Công tắc chuyển mạch tức thời (Toggle Switch) cho từng thiết bị kèm hoạt ảnh và trạng thái hoạt động trực quan.
  - Thanh trượt điều chỉnh công suất xung PWM (0 - 100%) cho Quạt và Đèn LED.
  - Nút Master Switch: "Dừng khẩn cấp toàn bộ thiết bị" (Emergency Stop) và "Bật chế độ tự động toàn bộ".
- **3.2. Màn hình Automation (Cấu hình Kịch bản Tự động hóa)**:
  - Danh sách các quy tắc tự động hóa đang hoạt động:
    * Quy tắc 1: Tưới nước tự động khi độ ẩm đất Khu 1 < 40% (ngắt khi >= 40%).
    * Quy tắc 2: Phun sương tự động khi độ ẩm không khí < 60% (ngắt khi >= 70% - dải trễ 10%).
    * Quy tắc 3: Bật quạt thông gió làm mát khi nhiệt độ > 30°C.
    * Quy tắc 4: Bật đèn chiếu sáng bổ sung khi ánh sáng LDR < 300 Lux.
  - Form thêm/sửa quy tắc: Lựa chọn khu vực, loại cảm biến, toán tử so sánh (>, <, >=, <=), giá trị ngưỡng, dải trễ chống dao động bật/tắt liên tục, thiết bị kích hoạt và công suất mong muốn.
  - Nút toggle bật/tắt nhanh từng quy tắc tự động.

### WBS 4: Trợ lý AI Chatbot & Cơ chế Xác nhận An toàn (`frontend_chatbot_security`)
- **4.1. Giao diện Chatbot Thông minh (Google Gemini Assistant)**:
  - Cửa sổ trò chuyện tương tác phong cách hiện đại: khung lịch sử tin nhắn, bong bóng chat phân biệt Người dùng và AI, thời gian gửi, hiệu ứng gõ chữ (typing indicator).
  - Menu Dropdown lựa chọn ngữ cảnh cây trồng / khu vực:
    * Khu vực 1: Cà chua (Tomato) - Ngưỡng chuẩn: Ngày 22-26°C, Đất 70-80%, Không khí 65-75%.
    * Khu vực 2: Xà lách (Lettuce) - Ngưỡng chuẩn: Ngày 15-20°C, Đất 60-70%, Không khí 60-70%.
    * Dâu tây (Strawberry), Dưa lưới (Melon), hoặc Tự do (Custom).
  - Hệ thống câu hỏi gợi ý nhanh (Quick Prompt Suggestions): "Độ ẩm đất hiện tại có thích hợp cho cà chua không?", "Nhiệt độ đang cao, tôi có nên bật quạt?", "Đề xuất chế độ tưới tối ưu hôm nay".
- **4.2. Khối Đề xuất Hành động (Action Proposal Card)**:
  - Khi AI phân tích thấy điều kiện môi trường bất thường và muốn đề xuất can thiệp phần cứng, AI sinh ra một thẻ đề xuất hành động nổi bật đính kèm tin nhắn.
  - Thẻ hiển thị rõ: Tên thiết bị, Khu vực áp dụng, Hành động đề xuất (Bật/Tắt/Chỉnh công suất), Lý do nông nghiệp, và 2 nút: **"Từ chối"** và **"Xác nhận Điều khiển"**.
- **4.3. Hộp thoại Xác nhận 2 bước Bắt buộc (Safe Confirmation Modal)**:
  - Nhấp vào "Xác nhận Điều khiển" sẽ mở **Hộp thoại Cảnh báo An toàn** (Modal).
  - Hộp thoại hiển thị thông tin rủi ro phần cứng, yêu cầu người dùng chủ động nhấn **"Đồng ý Thực thi"** thì lệnh mới được gửi tới tầng API Client để điều khiển thiết bị thực tế.
  - Cơ chế đảm bảo AI không bao giờ tự ý điều khiển phần cứng mà không có sự đồng thuận có ý thức từ con người (Zero Autonomous Actuation Without Explicit Consent).

### WBS 5: Đảm bảo Chất lượng, Bộ Test Tự động & Nghiệm thu (`frontend_qa_engineer`)
- **5.1. Thiết lập Môi trường Kiểm thử Tự động**:
  - Cấu hình Vitest, JSDOM, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
  - Khởi tạo mock cho ResizeObserver và HTMLCanvasElement phục vụ render Recharts.
- **5.2. Xây dựng Bộ Kiểm thử Tự động (Unit & Component Tests)**:
  - Test Suite 1: Render App Layout, Navbar, Connection Status Badge (online/offline).
  - Test Suite 2: Render Dashboard và xác minh hiển thị đầy đủ thông số 2 Khu vực (DHT11, độ ẩm đất) và LDR Gateway.
  - Test Suite 3: Render Controls Page và kiểm tra thao tác toggle bật/tắt thiết bị.
  - Test Suite 4: Render Automation Page và kiểm tra hiển thị form danh sách quy tắc ngưỡng.
  - Test Suite 5: Render Alerts Page và kiểm tra bộ lọc mức độ nghiêm trọng.
  - Test Suite 6: Render History Page và hiển thị biểu đồ phân tích thời gian.
  - Test Suite 7: Kiểm thử luồng an toàn Chatbot (Chatbot Safe Confirmation Flow):
    * Kiểm tra dropdown chọn cây trồng/khu vực.
    * Kiểm tra render Action Proposal Card khi có đề xuất.
    * Kiểm tra mở modal xác nhận an toàn.
    * Kiểm tra ca tích cực: Nhấn "Đồng ý Thực thi" -> Lệnh toggle thiết bị được kích hoạt thành công.
    * Kiểm tra ca tiêu cực: Nhấn "Hủy bỏ" -> Lệnh không được gửi đi, trạng thái thiết bị giữ nguyên.
- **5.3. Kiểm tra Build & Tiêu chuẩn Mã nguồn**:
  - Chạy `npm run build` xác nhận không có lỗi TypeScript, bundling thành công trong thư mục `dist/`.
  - Chạy `npm test` xác nhận 100% test cases vượt qua (PASS).

---

## 4. LUỒNG DỮ LIỆU VÀ PHỐI HỢP GIỮA CÁC MODULE (DATA FLOW & INTER-MODULE COORDINATION)

```
       ┌─────────────────────────────────────────────────────────────┐
       │                   Mock Telemetry Simulator                  │
       │ (5s interval, Diurnal Temperature/Humidity, Soil Depletion) │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ Telemetry stream
                                      ▼
                      ┌───────────────────────────────┐
                      │    IApiClient / MockService   │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │       GreenhouseContext       │
                      │  (Shared Application State)   │
                      └───────┬───────────────┬───────┘
                              │               │
            ┌─────────────────┴─────┐   ┌─────┴─────────────────┐
            │                       │   │                       │
            ▼                       ▼   ▼                       ▼
    ┌───────────────┐       ┌───────────────┐           ┌───────────────┐
    │ DashboardPage │       │  HistoryPage  │           │  AlertsPage   │
    │  (Live Data)  │       │(Charts/Trends)│           │ (Alert Logs)  │
    └───────────────┘       └───────────────┘           └───────────────┘
            │                                                   │
            │ Reads sensor metrics                              │ Threshold
            ▼                                                   │ violation
    ┌───────────────┐                                           │
    │  ChatbotPage  │◄──────────────────────────────────────────┘
    │(Gemini Prompt)│ Context: Current Temp, Humidity, Soil, Active Alerts
    └───────┬───────┘
            │ Proposes action (e.g. Turn on mist spray)
            ▼
    ┌───────────────────────────────┐
    │    ActionProposalCard (UI)    │
    └───────┬───────────────────────┘
            │ User clicks "Xác nhận Điều khiển"
            ▼
    ┌───────────────────────────────┐
    │    SafeConfirmModal (Modal)   │
    └───────┬───────────────────────┘
            │ User clicks "Đồng ý Thực thi"
            ▼
    ┌───────────────────────────────┐
    │  toggleActuator() / API Call  │
    └───────┬───────────────────────┘
            │ Updates state
            ▼
    ┌───────────────┐
    │ ControlsPage  │ ──► Trạng thái thiết bị đổi sang Active/ON
    └───────────────┘ ──► Telemetry simulator điều chỉnh môi trường (độ ẩm tăng)
```

---

## 5. MA TRẬN PHÂN ĐỊNH QUYỀN GHI FILE (FILE OWNERSHIP MATRIX)

Nhằm đảm bảo nguyên tắc an toàn, không có hai agent nào được chỉnh sửa cùng một tệp cùng một lúc:

| Thư mục / Tệp mã nguồn | Quyền sở hữu ghi (Write Owner) | Quyền đọc (Read Access) |
|---|---|---|
| `package.json`, `vite.config.ts`, `tailwind.config.js`, `tsconfig.json` | `frontend_lead_architect` | Mọi Agent |
| `src/types/*.ts` | `frontend_lead_architect` | Mọi Agent |
| `src/services/api/*`, `src/context/*`, `src/components/layout/*` | `frontend_lead_architect` | Mọi Agent |
| `src/pages/DashboardPage.tsx`, `src/pages/HistoryPage.tsx`, `src/pages/AlertsPage.tsx` | `frontend_core_dashboard` | Mọi Agent |
| `src/components/dashboard/*`, `src/components/history/*`, `src/components/alerts/*` | `frontend_core_dashboard` | Mọi Agent |
| `src/pages/ControlsPage.tsx`, `src/pages/AutomationPage.tsx` | `frontend_controls_automation` | Mọi Agent |
| `src/components/controls/*`, `src/components/automation/*` | `frontend_controls_automation` | Mọi Agent |
| `src/pages/ChatbotPage.tsx`, `src/components/chatbot/*`, `src/services/geminiService.ts` | `frontend_chatbot_security` | Mọi Agent |
| `vitest.config.ts`, `src/tests/*` | `frontend_qa_engineer` | Mọi Agent |

---

## 6. TIÊU CHÍ HOÀN THÀNH VÀ CHẤP THUẬN (ACCEPTANCE CRITERIA)

Mỗi agent phải đảm bảo sản phẩm của mình đạt chuẩn chất lượng trước khi bàn giao:
1. **Kiến trúc & Nền tảng**: Dự án khởi tạo sạch, thư viện cài đặt đầy đủ, không xung đột dependency, mock service mô phỏng đầy đủ dữ liệu 2 khu vực và LDR Gateway, App Layout hiển thị chuẩn responsive và huy hiệu Online/Offline rõ ràng.
2. **Giám sát vi khí hậu**: Hiển thị đầy đủ nhiệt độ DHT11, độ ẩm không khí, độ ẩm đất của Khu 1 và Khu 2; hiển thị ánh sáng LDR; biểu đồ lịch sử mượt mà với 2 trục Y và dải ngưỡng; bảng cảnh báo phân cấp chính xác.
3. **Điều khiển & Kịch bản**: Chuyển mạch toggle thiết bị phản hồi tức thời; điều chỉnh công suất xung PWM cho quạt và đèn mượt mà; form quy tắc tự động hóa hỗ trợ dải trễ chống dao động.
4. **Chatbot An toàn**: Tích hợp trợ lý Gemini tiếng Việt; dropdown chọn cây trồng và khu vực cập nhật ngữ cảnh chính xác; bắt buộc có hộp thoại xác nhận 2 bước trước khi kích hoạt lệnh điều khiển.
5. **Kiểm thử tự động**: 100% test cases trong `src/tests/` chạy thành công (`npm test`); lệnh build `npm run build` hoàn thành không cảnh báo lỗi nghiêm trọng.
