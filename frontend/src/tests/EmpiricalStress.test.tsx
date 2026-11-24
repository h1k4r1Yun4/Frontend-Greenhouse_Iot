import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GreenhouseProvider } from '../context/GreenhouseContext';
import { mockSimulator } from '../services/api/mockSimulator';
import { App } from '../App';
import { ChatWindow } from '../components/chatbot/ChatWindow';
import { ControlsPage } from '../pages/ControlsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { HistoryPage } from '../pages/HistoryPage';
import { DEFAULT_AUTOMATION_RULES } from '../constants/defaultRules';

describe('EMPIRICAL STRESS TEST HARNESS', () => {
  beforeEach(() => {
    mockSimulator.stop();
    mockSimulator.rules = [...DEFAULT_AUTOMATION_RULES];
    mockSimulator.actuators.forEach((a) => {
      a.isActive = false;
    });
  });

  afterEach(() => {
    mockSimulator.stop();
    mockSimulator.rules = [...DEFAULT_AUTOMATION_RULES];
    mockSimulator.actuators.forEach((a) => {
      a.isActive = false;
    });
  });

  // =========================================================================
  // SUITE 1: Mock Simulator Telemetry Emission & Physics Feedback Loops
  // =========================================================================
  describe('Suite 1: Mock Simulator & Physics Feedback Loops', () => {
    it('verifies water pump physics: soil moisture rises when ON and decays when OFF', () => {
      mockSimulator.zones[0].current.soilMoisture = 40.0;
      mockSimulator.zones[1].current.soilMoisture = 40.0;

      mockSimulator.setActuator('water_pump', 'ON');
      expect(mockSimulator.actuators.find((a) => a.id === 'water_pump')?.isActive).toBe(true);

      for (let i = 0; i < 5; i++) {
        mockSimulator.step();
      }

      const soilAfterPump = mockSimulator.zones[0].current.soilMoisture;
      expect(soilAfterPump).toBeGreaterThan(45.0);

      mockSimulator.setActuator('water_pump', 'OFF');

      for (let i = 0; i < 10; i++) {
        mockSimulator.step();
      }

      const soilAfterOff = mockSimulator.zones[0].current.soilMoisture;
      expect(soilAfterOff).toBeLessThan(soilAfterPump);
    });

    it('verifies mist spray physics: air humidity rises and temperature cools', () => {
      mockSimulator.zones[0].current.humidity = 60.0;
      mockSimulator.zones[0].current.temperature = 28.0;

      mockSimulator.setActuator('mist_spray', 'ON');

      for (let i = 0; i < 5; i++) {
        mockSimulator.step();
      }

      expect(mockSimulator.zones[0].current.humidity).toBeGreaterThan(65.0);
      expect(mockSimulator.zones[0].current.temperature).toBeLessThan(28.0);

      mockSimulator.setActuator('mist_spray', 'OFF');
    });

    it('verifies grow light physics: LDR Lux increases when light is ON', () => {
      mockSimulator.setActuator('grow_light', 'OFF');
      mockSimulator.step();
      const luxOff = mockSimulator.gateway.lightIntensity;

      mockSimulator.setActuator('grow_light', 'ON', 100);
      mockSimulator.step();
      const luxOn = mockSimulator.gateway.lightIntensity;

      expect(luxOn).toBeGreaterThan(luxOff + 200);
      mockSimulator.setActuator('grow_light', 'OFF');
    });

    it('survives rapid 100-step physics burst without NaN or array unbounded growth', () => {
      for (let i = 0; i < 100; i++) {
        mockSimulator.step();
      }

      for (const zone of mockSimulator.zones) {
        expect(Number.isNaN(zone.current.temperature)).toBe(false);
        expect(Number.isNaN(zone.current.humidity)).toBe(false);
        expect(Number.isNaN(zone.current.soilMoisture)).toBe(false);
        expect(zone.history.length).toBeLessThanOrEqual(50);
      }

      expect(Number.isNaN(mockSimulator.gateway.lightIntensity)).toBe(false);
      expect(mockSimulator.alerts.length).toBeLessThanOrEqual(30);
    });

    it('stress tests concurrent telemetry listeners under rapid streaming', () => {
      const listenerCount = 20;
      const receivedCounts = new Array(listenerCount).fill(0);
      const unsubs: (() => void)[] = [];

      for (let i = 0; i < listenerCount; i++) {
        const idx = i;
        const unsub = mockSimulator.subscribe(() => {
          receivedCounts[idx]++;
        });
        unsubs.push(unsub);
      }

      for (let i = 0; i < 5; i++) {
        mockSimulator.step();
      }

      for (let i = 0; i < listenerCount; i++) {
        expect(receivedCounts[i]).toBe(6);
      }

      unsubs.forEach((u) => u());

      mockSimulator.step();
      for (let i = 0; i < listenerCount; i++) {
        expect(receivedCounts[i]).toBe(6);
      }
    });

    it('VERIFIED FIX 1: PWM powerLevel = 0 produces zero cooling effect (uses ?? instead of ||)', () => {
      mockSimulator.rules = [];
      const fan = mockSimulator.actuators.find((a) => a.id === 'ventilation_fan')!;
      mockSimulator.zones[0].current.temperature = 25.5;
      fan.mode = 'manual';
      fan.isActive = true;
      fan.powerLevel = 0;

      for (let i = 0; i < 8; i++) {
        mockSimulator.step();
      }
      // At 0% PWM, coolingRate = 0 so temperature remains near 25.5°C (no 80% drop)
      const tempAtZeroPwm = mockSimulator.zones[0].current.temperature;
      expect(tempAtZeroPwm).toBeGreaterThan(24.7);

      // Compare against 100% PWM cooling
      mockSimulator.zones[0].current.temperature = 25.5;
      fan.powerLevel = 100;
      for (let i = 0; i < 8; i++) {
        mockSimulator.step();
      }
      expect(mockSimulator.zones[0].current.temperature).toBeLessThan(23.8);
    });

    it('VERIFIED FIX 2: automation rules with >= cleanly turn OFF via hysteresis deadband', () => {
      const geRule = {
        id: 'rule_ge_test',
        name: 'Turn on fan when temp >= 30',
        enabled: true,
        targetZone: 'zone1' as const,
        sensorType: 'temperature' as const,
        comparison: '>=' as const,
        threshold: 30,
        hysteresis: 5,
        actuatorId: 'ventilation_fan' as const,
        actuatorAction: 'ON' as const,
      };

      mockSimulator.rules = [geRule];
      const fan = mockSimulator.actuators.find((a) => a.id === 'ventilation_fan')!;
      fan.mode = 'auto';
      fan.isActive = false;

      // Temp reaches 32 >= 30 -> fan turns ON
      mockSimulator.zones[0].current.temperature = 32;
      mockSimulator.step();
      expect(fan.isActive).toBe(true);

      // Temp drops to 20°C (below 30 - 5 = 25°C) -> fan turns OFF cleanly
      mockSimulator.zones[0].current.temperature = 20;
      mockSimulator.step();
      expect(fan.isActive).toBe(false);
    });

    it('VERIFIED FIX 3: automation rules honor actuatorAction: "OFF"', () => {
      const offRule = {
        id: 'rule_off_test',
        name: 'Turn off pump when soil >= 75',
        enabled: true,
        targetZone: 'zone1' as const,
        sensorType: 'soilMoisture' as const,
        comparison: '>' as const,
        threshold: 75,
        hysteresis: 5,
        actuatorId: 'water_pump' as const,
        actuatorAction: 'OFF' as const,
      };

      mockSimulator.rules = [offRule];
      const pump = mockSimulator.actuators.find((a) => a.id === 'water_pump')!;
      pump.mode = 'auto';
      pump.isActive = true;

      // Soil reaches 80 > 75 -> OFF rule shuts down pump
      mockSimulator.zones[0].current.soilMoisture = 80;
      mockSimulator.step();
      expect(pump.isActive).toBe(false);

      // Soil drops to 65 (below 75 - 5 = 70) -> hysteresis reverts OFF rule back to ON
      mockSimulator.zones[0].current.soilMoisture = 65;
      mockSimulator.step();
      expect(pump.isActive).toBe(true);
    });
  });

  // =========================================================================
  // SUITE 2: Chatbot Safety Confirmation Modal State Transitions
  // =========================================================================
  describe('Suite 2: Chatbot Safety Confirmation Modal State Transitions', () => {
    it('NEGATIVE FLOW: User rejects proposal directly on card', async () => {
      render(
        <GreenhouseProvider>
          <ChatWindow />
        </GreenhouseProvider>
      );

      const quickChip = screen.getByRole('button', {
        name: /Nhiệt độ đang cao, tôi có nên bật quạt thông gió\?/i,
      });
      fireEvent.click(quickChip);

      const rejectBtn = await screen.findByRole('button', { name: /Từ chối/i }, { timeout: 3000 });
      fireEvent.click(rejectBtn);

      await waitFor(() => {
        expect(screen.getByText(/Đã từ chối/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Người dùng đã hủy bỏ đề xuất này. Thiết bị giữ nguyên trạng thái./i)
        ).toBeInTheDocument();
      });

      const fan = mockSimulator.actuators.find((a) => a.id === 'ventilation_fan');
      expect(fan?.isActive).toBe(false);
    });

    it('NEGATIVE FLOW: User opens modal then cancels (modal closes, action pending)', async () => {
      render(
        <GreenhouseProvider>
          <ChatWindow />
        </GreenhouseProvider>
      );

      const quickChip = screen.getByRole('button', {
        name: /Nhiệt độ đang cao, tôi có nên bật quạt thông gió\?/i,
      });
      fireEvent.click(quickChip);

      const openModalBtn = await screen.findByRole(
        'button',
        { name: /Xác nhận Điều khiển/i },
        { timeout: 3000 }
      );
      fireEvent.click(openModalBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Xác Nhận An Toàn Điều Khiển Phần Cứng/i)
        ).toBeInTheDocument();
      });

      const cancelBtn = screen.getByRole('button', { name: /Hủy bỏ \(Bỏ qua\)/i });
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(
          screen.queryByText(/Xác Nhận An Toàn Điều Khiển Phần Cứng/i)
        ).not.toBeInTheDocument();
      });

      const fan = mockSimulator.actuators.find((a) => a.id === 'ventilation_fan');
      expect(fan?.isActive).toBe(false);

      expect(screen.getByRole('button', { name: /Xác nhận Điều khiển/i })).toBeInTheDocument();
    });

    it('POSITIVE FLOW: Full end-to-end confirm executes hardware command and notifies chat', async () => {
      render(
        <GreenhouseProvider>
          <ChatWindow />
        </GreenhouseProvider>
      );

      const quickChip = screen.getByRole('button', {
        name: /Nhiệt độ đang cao, tôi có nên bật quạt thông gió\?/i,
      });
      fireEvent.click(quickChip);

      const openModalBtn = await screen.findByRole(
        'button',
        { name: /Xác nhận Điều khiển/i },
        { timeout: 3000 }
      );
      fireEvent.click(openModalBtn);

      const confirmBtn = await screen.findByRole(
        'button',
        { name: /ĐỒNG Ý THỰC THI/i },
        { timeout: 3000 }
      );
      fireEvent.click(confirmBtn);

      await waitFor(
        () => {
          expect(
            screen.getByText((content) => content.includes('Lệnh đã thực thi an toàn'))
          ).toBeInTheDocument();
          expect(screen.getByText('Đã thực thi')).toBeInTheDocument();
        },
        { timeout: 4000 }
      );

      const fan = mockSimulator.actuators.find((a) => a.id === 'ventilation_fan');
      expect(fan?.isActive).toBe(true);

      mockSimulator.setActuator('ventilation_fan', 'OFF');
    });
  });

  // =========================================================================
  // SUITE 3: Component Rendering Stability Under Rapid Updates
  // =========================================================================
  describe('Suite 3: Component Rendering Stability Under Rapid Updates', () => {
    it('Dashboard withstands 20 rapid telemetry state updates without unhandled exceptions', async () => {
      const { unmount } = render(
        <GreenhouseProvider>
          <DashboardPage />
        </GreenhouseProvider>
      );

      expect(screen.getByText(/Trung Tâm Giám Sát & Điều Hành Nhà Kính IoT/i)).toBeInTheDocument();

      await act(async () => {
        for (let i = 0; i < 20; i++) {
          mockSimulator.step();
          await new Promise((res) => setTimeout(res, 10));
        }
      });

      expect(screen.getByText(/Khu vực 1 \(Node 1 - ESP8266\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Khu vực 2 \(Node 2 - ESP8266\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Trạm Gateway ESP32 Trung tâm/i)).toBeInTheDocument();

      unmount();
    });

    it('ControlsPage withstands rapid toggles and Emergency Stop', async () => {
      render(
        <GreenhouseProvider>
          <ControlsPage />
        </GreenhouseProvider>
      );

      const toggleButtons = screen.getAllByRole('button', { name: /Bật tắt/i });
      expect(toggleButtons.length).toBe(4);

      for (const btn of toggleButtons) {
        fireEvent.click(btn);
      }

      await waitFor(() => {
        expect(mockSimulator.actuators.some((a) => a.isActive)).toBe(true);
      });

      const emgBtn = screen.getByRole('button', { name: /DỪNG KHẨN CẤP/i });
      fireEvent.click(emgBtn);

      await waitFor(() => {
        for (const a of mockSimulator.actuators) {
          expect(a.isActive).toBe(false);
        }
      });
    });

    it('HistoryPage handles rapid time range switching without crashing', async () => {
      render(
        <GreenhouseProvider>
          <HistoryPage />
        </GreenhouseProvider>
      );

      const btn24h = screen.getByRole('button', { name: '24 Giờ' });
      fireEvent.click(btn24h);

      const btn7d = screen.getByRole('button', { name: '7 Ngày' });
      fireEvent.click(btn7d);

      const btn1h = screen.getByRole('button', { name: '1 Giờ' });
      fireEvent.click(btn1h);

      await waitFor(() => {
        expect(screen.getByText(/Lịch Sử Đo Đạc & Phân Tích Biểu Đồ Chuỗi Thời Gian/i)).toBeInTheDocument();
      });
    });

    it('Full App renders and navigates between tabs smoothly under active streaming', async () => {
      const { unmount } = render(<App />);

      const navButtons = screen.getAllByRole('button');
      const controlsBtn = navButtons.find((b) => b.textContent?.includes('Điều khiển (Controls)'));
      expect(controlsBtn).toBeDefined();
      fireEvent.click(controlsBtn!);
      expect(screen.getByText(/Bảng Điều Khiển Từng Thiết Bị Phần Cứng/i)).toBeInTheDocument();

      const autoBtn = navButtons.find((b) => b.textContent?.includes('Tự động hóa (Automation)'));
      expect(autoBtn).toBeDefined();
      fireEvent.click(autoBtn!);
      expect(screen.getByText(/Kịch Bản & Quy Tắc Tự Động Hóa Vi Khí Hậu/i)).toBeInTheDocument();

      const alertsBtn = navButtons.find((b) => b.textContent?.includes('Cảnh báo (Alerts)'));
      expect(alertsBtn).toBeDefined();
      fireEvent.click(alertsBtn!);
      expect(screen.getByText(/Trung Tâm Cảnh Báo & Nhật Ký Sự Cố Hệ Thống/i)).toBeInTheDocument();

      const historyBtn = navButtons.find((b) => b.textContent?.includes('Lịch sử & Biểu đồ'));
      expect(historyBtn).toBeDefined();
      fireEvent.click(historyBtn!);
      expect(screen.getByText(/Lịch Sử Đo Đạc & Phân Tích Biểu Đồ Chuỗi Thời Gian/i)).toBeInTheDocument();

      const chatBtn = navButtons.find((b) => b.textContent?.includes('Trợ lý AI Gemini'));
      expect(chatBtn).toBeDefined();
      fireEvent.click(chatBtn!);
      expect(screen.getByText(/Trợ Lý Trí Tuệ Nhân Tạo Google Gemini/i)).toBeInTheDocument();

      const dashBtn = navButtons.find((b) => b.textContent?.includes('Tổng quan (Dashboard)'));
      expect(dashBtn).toBeDefined();
      fireEvent.click(dashBtn!);
      expect(screen.getByText(/Trung Tâm Giám Sát & Điều Hành Nhà Kính IoT/i)).toBeInTheDocument();

      unmount();
    });
  });
});
