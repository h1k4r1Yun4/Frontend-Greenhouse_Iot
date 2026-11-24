import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GreenhouseProvider } from '../context/GreenhouseContext';
import { ControlsPage } from '../pages/ControlsPage';
import { HysteresisVisualizer } from '../components/automation/HysteresisVisualizer';
import { SensorHistoryChart } from '../components/history/SensorHistoryChart';
import { ChatWindow } from '../components/chatbot/ChatWindow';
import { mockApiClient } from '../services/api/mockApiClient';
import { mockSimulator } from '../services/api/mockSimulator';

describe('CHALLENGER 1: EMPIRICAL FUNCTIONAL VERIFICATION SUITE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSimulator.stop();
    mockSimulator.actuators.forEach((a) => {
      a.isActive = false;
      a.powerLevel = 80;
    });
  });

  afterEach(() => {
    mockSimulator.stop();
    mockSimulator.actuators.forEach((a) => {
      a.isActive = false;
      a.powerLevel = 80;
    });
  });

  // =========================================================================
  // 1. Actuator Control Flow: manual toggle, PWM adjustments, presets, E-Stop
  // =========================================================================
  describe('Domain 1: Actuator Control Flow & E-Stop Latch State', () => {
    it('EMPIRICAL: Manual toggle toggles water pump ON and OFF with visual rocker switch reflection', async () => {
      render(
        <GreenhouseProvider>
          <ControlsPage />
        </GreenhouseProvider>
      );

      const pumpToggle = screen.getByRole('button', { name: /Bật tắt Máy bơm nước tưới gốc/i });
      expect(pumpToggle).toBeInTheDocument();

      // Initial state in simulator
      const pump = mockSimulator.actuators.find((a) => a.id === 'water_pump')!;
      expect(pump.isActive).toBe(false);

      // Toggle ON
      fireEvent.click(pumpToggle);
      await waitFor(() => {
        expect(pump.isActive).toBe(true);
      });

      // Toggle OFF
      fireEvent.click(pumpToggle);
      await waitFor(() => {
        expect(pump.isActive).toBe(false);
      });
    });

    it('EMPIRICAL: PWM slider adjusts from 0% to 100% and updates powerLevel accurately', async () => {
      render(
        <GreenhouseProvider>
          <ControlsPage />
        </GreenhouseProvider>
      );

      const fan = mockSimulator.actuators.find((a) => a.id === 'ventilation_fan')!;
      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBeGreaterThanOrEqual(2); // Fan & Light

      const fanSlider = sliders[0]; // Ventilation fan is first PWM actuator

      // Test 0%
      fireEvent.change(fanSlider, { target: { value: '0' } });
      await waitFor(() => {
        expect(fan.powerLevel).toBe(0);
      });

      // Test 50%
      fireEvent.change(fanSlider, { target: { value: '50' } });
      await waitFor(() => {
        expect(fan.powerLevel).toBe(50);
      });

      // Test 100%
      fireEvent.change(fanSlider, { target: { value: '100' } });
      await waitFor(() => {
        expect(fan.powerLevel).toBe(100);
      });
    });

    it('EMPIRICAL: Quick PWM presets (25%, 50%, 75%, 100%) apply exact power levels', async () => {
      render(
        <GreenhouseProvider>
          <ControlsPage />
        </GreenhouseProvider>
      );

      const fan = mockSimulator.actuators.find((a) => a.id === 'ventilation_fan')!;

      // Find preset buttons for 25%, 50%, 75%, 100%
      const preset25Buttons = screen.getAllByRole('button', { name: '25%' });
      const preset50Buttons = screen.getAllByRole('button', { name: '50%' });
      const preset75Buttons = screen.getAllByRole('button', { name: '75%' });
      const preset100Buttons = screen.getAllByRole('button', { name: '100%' });

      expect(preset25Buttons.length).toBeGreaterThanOrEqual(2);

      // Test Preset 25%
      fireEvent.click(preset25Buttons[0]);
      await waitFor(() => expect(fan.powerLevel).toBe(25));

      // Test Preset 50%
      fireEvent.click(preset50Buttons[0]);
      await waitFor(() => expect(fan.powerLevel).toBe(50));

      // Test Preset 75%
      fireEvent.click(preset75Buttons[0]);
      await waitFor(() => expect(fan.powerLevel).toBe(75));

      // Test Preset 100%
      fireEvent.click(preset100Buttons[0]);
      await waitFor(() => expect(fan.powerLevel).toBe(100));
    });

    it('EMPIRICAL: Industrial E-Stop latches EMERGENCY HALTED state and Re-arm resets it cleanly', async () => {
      render(
        <GreenhouseProvider>
          <ControlsPage />
        </GreenhouseProvider>
      );

      // Turn ON an actuator first
      const pump = mockSimulator.actuators.find((a) => a.id === 'water_pump')!;
      pump.isActive = true;

      // E-Stop button
      const emgButton = screen.getByRole('button', { name: /DỪNG KHẨN CẤP \(EMERGENCY STOP\)/i });
      expect(emgButton).toBeInTheDocument();

      // Before E-Stop: No latch banner
      expect(screen.queryByText(/Cờ Trạng Thái: EMERGENCY HALTED/i)).not.toBeInTheDocument();

      // Click E-Stop
      fireEvent.click(emgButton);

      // Invariant 1: All actuators shut down immediately
      await waitFor(() => {
        expect(mockSimulator.actuators.every((a) => !a.isActive)).toBe(true);
      });

      // Invariant 2: EMERGENCY HALTED state latch banner appears
      expect(screen.getByText(/Cờ Trạng Thái: EMERGENCY HALTED/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Toàn bộ 4 thiết bị đã bị ngắt điện an toàn để bảo vệ phần cứng và cây trồng\./i)
      ).toBeInTheDocument();

      // Invariant 3: Re-arm button restores latch state
      const rearmButton = screen.getByRole('button', { name: /Khôi phục hệ thống \(Re-arm System\)/i });
      expect(rearmButton).toBeInTheDocument();

      fireEvent.click(rearmButton);

      // Latch banner dismissed
      await waitFor(() => {
        expect(screen.queryByText(/Cờ Trạng Thái: EMERGENCY HALTED/i)).not.toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // 2. Hysteresis Visualizer calculations: both `<` and `>` conditions
  // =========================================================================
  describe('Domain 2: Hysteresis Visualizer Mathematical Soundness', () => {
    it('EMPIRICAL: "<" condition (Irrigation) computes correct Trigger, Holding Band, and Safe Zone', () => {
      // Rule: Turn on water pump if soilMoisture < 40%, hysteresis = 10%
      const { container } = render(
        <HysteresisVisualizer
          sensorType="soilMoisture"
          comparison="<"
          threshold={40}
          hysteresis={10}
          currentValue={35}
          actuatorName="Máy bơm nước"
          actuatorAction="ON"
        />
      );

      // Labels check
      expect(screen.getByText(/Trực quan hóa Dải trễ \(Hysteresis Band\): ±10 %/i)).toBeInTheDocument();
      expect(screen.getByText(/40% \(Kích hoạt\)/i)).toBeInTheDocument();
      expect(screen.getByText(/50% \(Ngắt\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Đo: 35%/i)).toBeInTheDocument();

      // Bands mathematical coordinates verification:
      // soilMoisture: min=0, max=100 -> span = 100
      // trigger = 40% (at 40)
      // reset = 40 + 10 = 50% (at 50)
      // Active Band: left = 0%, width = 40%
      // Holding Band: left = 40%, width = 10%
      // Safe Band: left = 50%, width = 50%
      const track = container.querySelector('.rounded-full.overflow-hidden');
      expect(track).toBeInTheDocument();

      const bands = track?.querySelectorAll(':scope > div');
      expect(bands?.length).toBe(3);

      const activeBand = bands?.[0] as HTMLElement;
      const holdingBand = bands?.[1] as HTMLElement;
      const safeBand = bands?.[2] as HTMLElement;

      expect(activeBand.style.left).toBe('0%');
      expect(activeBand.style.width).toBe('40%');

      expect(holdingBand.style.left).toBe('40%');
      expect(holdingBand.style.width).toBe('10%');

      expect(safeBand.style.left).toBe('50%');
      expect(safeBand.style.width).toBe('50%');

      // Verify continuous 100% coverage
      const totalWidth = parseFloat(activeBand.style.width) + parseFloat(holdingBand.style.width) + parseFloat(safeBand.style.width);
      expect(totalWidth).toBe(100);
    });

    it('EMPIRICAL: ">" condition (Cooling / Ventilation) computes correct Trigger, Holding Band, and Safe Zone', () => {
      // Rule: Turn on fan if temperature > 32°C, hysteresis = 3°C
      // temperature: min=15, max=45 -> span = 30
      // trigger = 32°C -> toPct(32) = ((32 - 15) / 30) * 100 = 56.666666666666664%
      // reset = 32 - 3 = 29°C -> toPct(29) = ((29 - 15) / 30) * 100 = 46.666666666666664%
      const { container } = render(
        <HysteresisVisualizer
          sensorType="temperature"
          comparison=">"
          threshold={32}
          hysteresis={3}
          currentValue={30}
          actuatorName="Quạt thông gió"
          actuatorAction="ON"
        />
      );

      expect(screen.getByText(/32°C \(Kích hoạt\)/i)).toBeInTheDocument();
      expect(screen.getByText(/29°C \(Ngắt\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Đo: 30°C/i)).toBeInTheDocument();

      const track = container.querySelector('.rounded-full.overflow-hidden');
      const bands = track?.querySelectorAll(':scope > div');
      expect(bands?.length).toBe(3);

      const activeBand = bands?.[0] as HTMLElement;
      const holdingBand = bands?.[1] as HTMLElement;
      const safeBand = bands?.[2] as HTMLElement;

      // In ">" branch:
      // safeBand: left = 0%, width = resetPct (46.666...%)
      // holdingBand: left = resetPct (46.666...%), width = triggerPct - resetPct = 10%
      // activeBand: left = triggerPct (56.666...%), width = 100 - triggerPct (43.333...%)
      const safeWidth = parseFloat(safeBand.style.width);
      const holdingWidth = parseFloat(holdingBand.style.width);
      const activeWidth = parseFloat(activeBand.style.width);

      expect(safeBand.style.left).toBe('0%');
      expect(safeWidth).toBeCloseTo(46.666, 1);

      expect(parseFloat(holdingBand.style.left)).toBeCloseTo(46.666, 1);
      expect(holdingWidth).toBeCloseTo(10, 1);

      expect(parseFloat(activeBand.style.left)).toBeCloseTo(56.666, 1);
      expect(activeWidth).toBeCloseTo(43.333, 1);

      // Verify partition of unity: 46.666 + 10 + 43.333 = 100%
      expect(safeWidth + holdingWidth + activeWidth).toBeCloseTo(100, 1);
    });

    it('EMPIRICAL: Clamping guarantees bounds stay within [0%, 100%] even under extreme inputs', () => {
      // Extreme input: threshold = 110 (above max 100), hysteresis = 20
      const { container } = render(
        <HysteresisVisualizer
          sensorType="soilMoisture"
          comparison="<"
          threshold={110}
          hysteresis={20}
        />
      );

      const track = container.querySelector('.rounded-full.overflow-hidden');
      const bands = track?.querySelectorAll(':scope > div');
      const activeBand = bands?.[0] as HTMLElement;
      const holdingBand = bands?.[1] as HTMLElement;
      const safeBand = bands?.[2] as HTMLElement;

      const aW = parseFloat(activeBand.style.width);
      const hW = parseFloat(holdingBand.style.width);
      const sW = parseFloat(safeBand.style.width);

      expect(aW).toBe(100);
      expect(hW).toBe(0);
      expect(sW).toBe(0);
      expect(aW + hW + sW).toBe(100);
    });
  });

  // =========================================================================
  // 3. Recharts multi-axis visualization: Lux data points, toggles, CSV export
  // =========================================================================
  describe('Domain 3: Recharts Telemetry, Lux Multi-Axis & CSV Export', () => {
    it('EMPIRICAL: Telemetry history points include lightIntensity (Lux) with valid numeric values', async () => {
      const history1h = await mockApiClient.getHistory('zone1', '1h');
      const history24h = await mockApiClient.getHistory('zone1', '24h');
      const history7d = await mockApiClient.getHistory('zone1', '7d');

      for (const dataset of [history1h, history24h, history7d]) {
        expect(dataset.length).toBeGreaterThan(0);
        for (const pt of dataset) {
          expect(pt).toHaveProperty('lightIntensity');
          expect(typeof pt.lightIntensity).toBe('number');
          expect(Number.isNaN(pt.lightIntensity)).toBe(false);
          expect(pt.lightIntensity).toBeGreaterThanOrEqual(0);
          expect(pt.lightIntensity).toBeLessThanOrEqual(100000);
        }
      }
    });

    it('EMPIRICAL: Metric toggles toggle visibility without unhandled exceptions', async () => {
      render(<SensorHistoryChart />);

      await waitFor(() => {
        expect(screen.getByTestId('history-chart-container')).toBeInTheDocument();
      });

      const tempToggle = screen.getByRole('button', { name: /Nhiệt độ \(°C\)/i });
      const humToggle = screen.getByRole('button', { name: /Độ ẩm không khí \(%\)/i });
      const soilToggle = screen.getByRole('button', { name: /Độ ẩm đất \(%\)/i });
      const luxToggle = screen.getByRole('button', { name: /Ánh sáng \(Lux\)/i });

      // Toggle off and on
      fireEvent.click(luxToggle);
      fireEvent.click(tempToggle);
      fireEvent.click(humToggle);
      fireEvent.click(soilToggle);

      // Toggle back on
      fireEvent.click(luxToggle);
      fireEvent.click(tempToggle);
      fireEvent.click(humToggle);
      fireEvent.click(soilToggle);

      expect(screen.getByTestId('history-chart-container')).toBeInTheDocument();
    });

    it('EMPIRICAL: CSV Export produces valid RFC-4180 comma-separated telemetry rows', async () => {
      let createdBlob: Blob | null = null;

      // Mock createObjectURL & DOM anchor click
      const originalCreateObjectURL = window.URL.createObjectURL;
      window.URL.createObjectURL = vi.fn((blob: Blob) => {
        createdBlob = blob;
        return 'blob:mock-url';
      });

      render(<SensorHistoryChart initialZone="zone1" />);

      await waitFor(() => {
        expect(screen.queryByText(/Đang tải dữ liệu biểu đồ/i)).not.toBeInTheDocument();
      });

      const exportBtn = screen.getByRole('button', { name: /Xuất dữ liệu CSV/i });
      fireEvent.click(exportBtn);

      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(createdBlob).not.toBeNull();

      // Read blob content
      const csvContent = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(createdBlob!);
      });

      const lines = csvContent.trim().split('\n');
      expect(lines.length).toBeGreaterThan(5);

      // Verify CSV header
      expect(lines[0]).toBe('Timestamp,TimeLabel,Temperature(C),AirHumidity(%),SoilMoisture(%),Light(Lux)');

      // Verify row format
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        const cols = row.split(',');
        // Format: "ISO-timestamp","timeLabel",temp,humidity,soilMoisture,lightIntensity
        expect(cols.length).toBe(6);
        expect(cols[0].startsWith('"')).toBe(true);
        expect(Number.isNaN(Number(cols[2]))).toBe(false); // Temperature
        expect(Number.isNaN(Number(cols[3]))).toBe(false); // Humidity
        expect(Number.isNaN(Number(cols[4]))).toBe(false); // Soil
        expect(Number.isNaN(Number(cols[5]))).toBe(false); // Light Lux
      }

      window.URL.createObjectURL = originalCreateObjectURL;
    });
  });

  // =========================================================================
  // 4. AI Chatbot 2-step Safe Confirmation: Rejection vs Confirmation
  // =========================================================================
  describe('Domain 4: AI Chatbot 2-Step Safe Confirmation Guarantees', () => {
    it('EMPIRICAL: Direct proposal rejection preserves hardware state and records rejection', async () => {
      const toggleSpy = vi.spyOn(mockApiClient, 'toggleActuator');

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
          screen.getByText(/Người dùng đã hủy bỏ đề xuất này\. Thiết bị giữ nguyên trạng thái\./i)
        ).toBeInTheDocument();
      });

      // INVARIANT: toggleActuator never dispatched
      expect(toggleSpy).not.toHaveBeenCalled();

      // INVARIANT: Hardware actuator remains OFF
      const fan = mockSimulator.actuators.find((a) => a.id === 'ventilation_fan');
      expect(fan?.isActive).toBe(false);

      toggleSpy.mockRestore();
    });

    it('EMPIRICAL: Modal cancellation preserves hardware state and closes modal safely', async () => {
      const toggleSpy = vi.spyOn(mockApiClient, 'toggleActuator');

      render(
        <GreenhouseProvider>
          <ChatWindow />
        </GreenhouseProvider>
      );

      const quickChip = screen.getByRole('button', {
        name: /Nhiệt độ đang cao, tôi có nên bật quạt thông gió\?/i,
      });
      fireEvent.click(quickChip);

      const openModalBtn = await screen.findByRole('button', { name: /Xác nhận Điều khiển/i }, { timeout: 3000 });
      fireEvent.click(openModalBtn);

      // Verify 3-stage visual pipeline modal is displayed
      await waitFor(() => {
        expect(screen.getByText(/Xác Nhận An Toàn Điều Khiển Phần Cứng \(2-Step Safety\)/i)).toBeInTheDocument();
        expect(screen.getByText(/AI Đề xuất/i)).toBeInTheDocument();
        expect(screen.getByText(/Con người Phê duyệt/i)).toBeInTheDocument();
        expect(screen.getByText(/Phát lệnh MQTT/i)).toBeInTheDocument();
      });

      // Cancel modal
      const cancelBtn = screen.getByRole('button', { name: /Hủy bỏ \(Bỏ qua\)/i });
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByText(/Xác Nhận An Toàn Điều Khiển Phần Cứng \(2-Step Safety\)/i)).not.toBeInTheDocument();
      });

      // INVARIANT: toggleActuator never dispatched
      expect(toggleSpy).not.toHaveBeenCalled();
      const fan = mockSimulator.actuators.find((a) => a.id === 'ventilation_fan');
      expect(fan?.isActive).toBe(false);

      toggleSpy.mockRestore();
    });

    it('EMPIRICAL: Modal confirmation executes hardware actuation and updates chat feedback', async () => {
      const toggleSpy = vi.spyOn(mockApiClient, 'toggleActuator');

      render(
        <GreenhouseProvider>
          <ChatWindow />
        </GreenhouseProvider>
      );

      const quickChip = screen.getByRole('button', {
        name: /Nhiệt độ đang cao, tôi có nên bật quạt thông gió\?/i,
      });
      fireEvent.click(quickChip);

      const openModalBtn = await screen.findByRole('button', { name: /Xác nhận Điều khiển/i }, { timeout: 3000 });
      fireEvent.click(openModalBtn);

      const executeBtn = await screen.findByRole('button', { name: /ĐỒNG Ý THỰC THI/i }, { timeout: 3000 });
      fireEvent.click(executeBtn);

      // INVARIANT: toggleActuator dispatched
      await waitFor(() => {
        expect(toggleSpy).toHaveBeenCalledWith('ventilation_fan', 'ON', 85);
      });

      // INVARIANT: Actuator state becomes active in simulator
      const fan = mockSimulator.actuators.find((a) => a.id === 'ventilation_fan');
      await waitFor(() => {
        expect(fan?.isActive).toBe(true);
      });

      // INVARIANT: Confirmation reflected in UI
      await waitFor(() => {
        expect(screen.getByText('Đã thực thi')).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Lệnh đã thực thi an toàn'))).toBeInTheDocument();
      });

      toggleSpy.mockRestore();
    });
  });
});
