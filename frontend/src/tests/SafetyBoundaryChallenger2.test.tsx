import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { GreenhouseProvider, useGreenhouse } from '../context/GreenhouseContext';
import { ControlsPage } from '../pages/ControlsPage';
import { AutomationPage } from '../pages/AutomationPage';
import { ChatWindow } from '../components/chatbot/ChatWindow';
import { HysteresisVisualizer } from '../components/automation/HysteresisVisualizer';
import { Navbar } from '../components/layout/Navbar';
import { AppContent } from '../App';
import { mockApiClient } from '../services/api/mockApiClient';
import { mockSimulator } from '../services/api/mockSimulator';
import { DEFAULT_AUTOMATION_RULES } from '../constants/defaultRules';

describe('Safety & Boundary Challenger 2 Verification Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSimulator.stop();
    mockSimulator.rules = [...DEFAULT_AUTOMATION_RULES];
    mockSimulator.actuators.forEach((a) => {
      a.isActive = false;
    });
  });

  // Helper component to configure role in context
  const ContextRoleSetter: React.FC<{ role: 'admin' | 'operator' | 'viewer'; children: React.ReactNode }> = ({
    role,
    children,
  }) => {
    const { setUserRole } = useGreenhouse();
    React.useEffect(() => {
      setUserRole(role);
    }, [role, setUserRole]);
    return <>{children}</>;
  };

  // =========================================================================
  // 1. ROLE-BASED ACCESS CONTROL (RBAC) ADVERSARIAL TESTING
  // =========================================================================
  describe('Adversarial RBAC Verification: Viewer Restrictions', () => {
    it('PREVENTS viewer from toggling actuator switches and altering PWM power', async () => {
      const toggleSpy = vi.spyOn(mockApiClient, 'toggleActuator');
      const setPowerSpy = vi.spyOn(mockApiClient, 'setActuatorPower');

      render(
        <GreenhouseProvider>
          <ContextRoleSetter role="viewer">
            <ControlsPage />
          </ContextRoleSetter>
        </GreenhouseProvider>
      );

      // Verify viewer warning is displayed
      expect(screen.getByText(/Bạn đang đăng nhập với vai trò/i)).toBeInTheDocument();
      expect(screen.getByText(/Người xem \(Viewer\)/i)).toBeInTheDocument();

      // Find pump rocker switch
      const pumpToggleBtn = screen.getByRole('button', { name: /Bật tắt Máy bơm nước tưới gốc/i });
      expect(pumpToggleBtn).toBeDisabled();

      // Attempt to click disabled rocker switch
      fireEvent.click(pumpToggleBtn);
      expect(toggleSpy).not.toHaveBeenCalled();

      // Find PWM slider (for fan)
      const pwmSliders = screen.getAllByRole('slider');
      expect(pwmSliders.length).toBeGreaterThan(0);
      const fanSlider = pwmSliders[0];
      expect(fanSlider).toBeDisabled();

      // Attempt to change slider value
      fireEvent.change(fanSlider, { target: { value: '75' } });
      expect(setPowerSpy).not.toHaveBeenCalled();

      // Check preset buttons (25%, 50%, 75%, 100%)
      const preset25Btn = screen.getAllByRole('button', { name: '25%' })[0];
      expect(preset25Btn).toBeDisabled();
      fireEvent.click(preset25Btn);
      expect(setPowerSpy).not.toHaveBeenCalled();

      toggleSpy.mockRestore();
      setPowerSpy.mockRestore();
    });

    it('PREVENTS viewer from adding, editing, or deleting automation rules', async () => {
      const addRuleSpy = vi.spyOn(mockApiClient, 'addRule');
      const updateRuleSpy = vi.spyOn(mockApiClient, 'updateRule');
      const deleteRuleSpy = vi.spyOn(mockApiClient, 'deleteRule');

      render(
        <GreenhouseProvider>
          <ContextRoleSetter role="viewer">
            <AutomationPage />
          </ContextRoleSetter>
        </GreenhouseProvider>
      );

      // 1. "Thêm Quy Tắc Mới" button MUST be disabled
      const addBtn = screen.getByRole('button', { name: /Thêm Quy Tắc Mới/i });
      expect(addBtn).toBeDisabled();
      fireEvent.click(addBtn);
      expect(addRuleSpy).not.toHaveBeenCalled();

      // 2. Edit (pencil) buttons must NOT exist in the DOM for viewer
      const editButtons = screen.queryAllByTitle(/Chỉnh sửa quy tắc/i);
      expect(editButtons.length).toBe(0);

      // 3. Delete (trash) buttons must NOT exist in the DOM for viewer
      const deleteButtons = screen.queryAllByTitle(/Xóa quy tắc/i);
      expect(deleteButtons.length).toBe(0);

      // 4. Power toggle buttons for rules must be disabled
      const ruleToggleButtons = screen.getAllByTitle(/Tắt quy tắc|Bật quy tắc/i);
      expect(ruleToggleButtons.length).toBeGreaterThan(0);
      for (const btn of ruleToggleButtons) {
        expect(btn).toBeDisabled();
      }

      addRuleSpy.mockRestore();
      updateRuleSpy.mockRestore();
      deleteRuleSpy.mockRestore();
    });

    it('PREVENTS viewer from confirming or executing chatbot hardware proposals', async () => {
      const toggleSpy = vi.spyOn(mockApiClient, 'toggleActuator');

      render(
        <GreenhouseProvider>
          <ContextRoleSetter role="viewer">
            <ChatWindow />
          </ContextRoleSetter>
        </GreenhouseProvider>
      );

      // Trigger proposal by asking chatbot
      const input = screen.getByPlaceholderText(/Hỏi trợ lý AI về tưới nước/i);
      fireEvent.change(input, { target: { value: 'Tưới nước cho cà chua ngay bây giờ' } });
      fireEvent.click(screen.getByLabelText(/Gửi tin nhắn/i));

      // Wait for AI proposal card
      await waitFor(() => {
        expect(screen.getByText(/ĐỀ XUẤT ĐIỀU KHIỂN THIẾT BỊ TỪ AI/i)).toBeInTheDocument();
      });

      // Confirm button MUST be disabled for Viewer with read-only notice
      const openModalBtn = screen.getByRole('button', { name: /Xác nhận Điều khiển/i });
      expect(openModalBtn).toBeDisabled();
      expect(screen.getByText(/Vai trò Người xem \(Viewer\) chỉ có quyền đọc/i)).toBeInTheDocument();

      // Clicking disabled button must NOT open modal or dispatch command
      fireEvent.click(openModalBtn);
      expect(
        screen.queryByText(/Xác Nhận An Toàn Điều Khiển Phần Cứng \(2-Step Safety\)/i)
      ).not.toBeInTheDocument();
      expect(toggleSpy).not.toHaveBeenCalled();

      toggleSpy.mockRestore();
    });
  });

  // =========================================================================
  // 2. EMERGENCY STOP SAFETY & LATCHING
  // =========================================================================
  describe('Emergency Stop Safety & Latch Mechanism', () => {
    it('pressing E-Stop immediately shuts down all actuators and triggers EMERGENCY HALTED banner', async () => {
      // First turn on an actuator in admin mode
      mockSimulator.actuators[0].isActive = true;
      mockSimulator.actuators[1].isActive = true;

      render(
        <GreenhouseProvider>
          <ContextRoleSetter role="admin">
            <ControlsPage />
          </ContextRoleSetter>
        </GreenhouseProvider>
      );

      // Press Emergency Stop
      const emgBtn = screen.getByRole('button', { name: /DỪNG KHẨN CẤP/i });
      fireEvent.click(emgBtn);

      // 1. EMERGENCY HALTED state latch banner must appear
      expect(screen.getByText(/Cờ Trạng Thái: EMERGENCY HALTED/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Toàn bộ 4 thiết bị đã bị ngắt điện an toàn/i)
      ).toBeInTheDocument();

      // 2. Actuators in simulator must be shut down
      mockSimulator.actuators.forEach((a) => {
        expect(a.isActive).toBe(false);
      });

      // 3. Re-arm button is available
      const rearmBtn = screen.getByRole('button', { name: /Khôi phục hệ thống \(Re-arm System\)/i });
      expect(rearmBtn).toBeInTheDocument();

      // 4. Clicking Re-arm dismisses the latch banner
      fireEvent.click(rearmBtn);
      expect(screen.queryByText(/Cờ Trạng Thái: EMERGENCY HALTED/i)).not.toBeInTheDocument();
    });

    it('INTERLOCKS actuator switches while EMERGENCY HALTED banner is active until Re-arm', async () => {
      render(
        <GreenhouseProvider>
          <ContextRoleSetter role="admin">
            <ControlsPage />
          </ContextRoleSetter>
        </GreenhouseProvider>
      );

      const emgBtn = screen.getByRole('button', { name: /DỪNG KHẨN CẤP/i });
      fireEvent.click(emgBtn);

      // Banner is active
      expect(screen.getByText(/Cờ Trạng Thái: EMERGENCY HALTED/i)).toBeInTheDocument();

      // Pump switch MUST be disabled while halted
      const pumpToggleBtn = screen.getByRole('button', { name: /Bật tắt Máy bơm nước tưới gốc/i });
      expect(pumpToggleBtn).toBeDisabled();

      // Re-arming unlocks the actuator switches
      const rearmBtn = screen.getByRole('button', { name: /Khôi phục hệ thống \(Re-arm System\)/i });
      fireEvent.click(rearmBtn);

      await waitFor(() => {
        expect(pumpToggleBtn).not.toBeDisabled();
      });
    });
  });

  // =========================================================================
  // 3. HYSTERESIS BOUNDARIES & NUMERICAL STABILITY
  // =========================================================================
  describe('Hysteresis Boundaries & Numerical Extremes', () => {
    it('handles zero hysteresis (hysteresis = 0) without dividing by zero or error', () => {
      const { container } = render(
        <HysteresisVisualizer
          sensorType="soilMoisture"
          comparison="<"
          threshold={40}
          hysteresis={0}
          currentValue={40}
        />
      );
      expect(container).toBeInTheDocument();
      expect(screen.getByText(/±0 %/i)).toBeInTheDocument();
      expect(screen.getByText(/40% \(Kích hoạt\)/i)).toBeInTheDocument();
      expect(screen.getByText(/40% \(Ngắt\)/i)).toBeInTheDocument();
    });

    it('handles inverted comparisons (> and >=) correctly', () => {
      const { container } = render(
        <HysteresisVisualizer
          sensorType="temperature"
          comparison=">"
          threshold={32}
          hysteresis={2}
          currentValue={30}
        />
      );
      expect(container).toBeInTheDocument();
      expect(screen.getByText(/32°C \(Kích hoạt\)/i)).toBeInTheDocument();
      expect(screen.getByText(/30°C \(Ngắt\)/i)).toBeInTheDocument();
    });

    it('handles extreme out-of-bound threshold values (-999 and +9999) safely', () => {
      const { container: c1 } = render(
        <HysteresisVisualizer
          sensorType="humidity"
          comparison="<"
          threshold={-999}
          hysteresis={10}
        />
      );
      expect(c1).toBeInTheDocument();

      const { container: c2 } = render(
        <HysteresisVisualizer
          sensorType="lightIntensity"
          comparison=">"
          threshold={99999}
          hysteresis={50}
        />
      );
      expect(c2).toBeInTheDocument();
    });

    it('handles negative hysteresis and extreme sensor values without crashing', () => {
      const { container } = render(
        <HysteresisVisualizer
          sensorType="soilMoisture"
          comparison="<="
          threshold={50}
          hysteresis={-10}
          currentValue={-50}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('handles unknown sensorType fallback gracefully', () => {
      const { container } = render(
        <HysteresisVisualizer
          sensorType={'customMetric' as any}
          comparison="<"
          threshold={50}
          hysteresis={5}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 4. SAFE CONFIRMATION MODAL INTEGRATION & REJECTION INTEGRITY
  // =========================================================================
  describe('Safe Confirmation Modal Integrity', () => {
    it('guarantees dismissing modal via cancel leaves hardware untouched and sends NO command', async () => {
      const toggleSpy = vi.spyOn(mockApiClient, 'toggleActuator');

      render(
        <GreenhouseProvider>
          <ChatWindow />
        </GreenhouseProvider>
      );

      const input = screen.getByPlaceholderText(/Hỏi trợ lý AI về tưới nước/i);
      fireEvent.change(input, { target: { value: 'Bật máy bơm nước tưới cà chua' } });
      fireEvent.click(screen.getByLabelText(/Gửi tin nhắn/i));

      await waitFor(() => {
        expect(screen.getByText(/ĐỀ XUẤT ĐIỀU KHIỂN THIẾT BỊ TỪ AI/i)).toBeInTheDocument();
      });

      // Open Modal
      fireEvent.click(screen.getByRole('button', { name: /Xác nhận Điều khiển/i }));

      await waitFor(() => {
        expect(screen.getByText(/Xác Nhận An Toàn Điều Khiển Phần Cứng/i)).toBeInTheDocument();
      });

      // Dismiss via "Hủy bỏ (Bỏ qua)"
      fireEvent.click(screen.getByRole('button', { name: /Hủy bỏ \(Bỏ qua\)/i }));

      // Verify modal is closed
      await waitFor(() => {
        expect(screen.queryByText(/Xác Nhận An Toàn Điều Khiển Phần Cứng/i)).not.toBeInTheDocument();
      });

      // Verify NO command sent
      expect(toggleSpy).not.toHaveBeenCalled();

      toggleSpy.mockRestore();
    });

    it('guarantees rejecting directly on proposal card leaves hardware untouched', async () => {
      const toggleSpy = vi.spyOn(mockApiClient, 'toggleActuator');

      render(
        <GreenhouseProvider>
          <ChatWindow />
        </GreenhouseProvider>
      );

      const input = screen.getByPlaceholderText(/Hỏi trợ lý AI về tưới nước/i);
      fireEvent.change(input, { target: { value: 'Bật máy bơm nước tưới cà chua' } });
      fireEvent.click(screen.getByLabelText(/Gửi tin nhắn/i));

      await waitFor(() => {
        expect(screen.getByText(/ĐỀ XUẤT ĐIỀU KHIỂN THIẾT BỊ TỪ AI/i)).toBeInTheDocument();
      });

      // Click "Từ chối"
      fireEvent.click(screen.getByRole('button', { name: /Từ chối/i }));

      await waitFor(() => {
        expect(screen.getByText(/Người dùng đã hủy bỏ đề xuất này/i)).toBeInTheDocument();
      });

      expect(toggleSpy).not.toHaveBeenCalled();

      toggleSpy.mockRestore();
    });
  });

  // =========================================================================
  // 5. RESPONSIVE LAYOUT BOUNDARY & 360PX FIT
  // =========================================================================
  describe('Responsive Layout Boundary (Mobile <640px and 360px fit)', () => {
    it('renders mobile-specific compact role selector and hamburger toggle', () => {
      render(
        <GreenhouseProvider>
          <Navbar onOpenMobileMenu={vi.fn()} onNavigateAlerts={vi.fn()} />
        </GreenhouseProvider>
      );

      // Verify mobile compact select element exists with aria-label
      const select = screen.getByLabelText('Chọn vai trò người dùng');
      expect(select).toBeInTheDocument();

      // Verify mobile hamburger menu exists with aria-label
      const hamburger = screen.getByLabelText('Mở menu điều hướng');
      expect(hamburger).toBeInTheDocument();
    });

    it('renders App shell with mobile bottom navigation bar', () => {
      render(
        <GreenhouseProvider>
          <AppContent />
        </GreenhouseProvider>
      );

      // Verify bottom navigation items exist with touch targets
      const overviewBtn = screen.getByRole('button', { name: /^Tổng quan$/ });
      expect(overviewBtn).toBeInTheDocument();
      expect(overviewBtn.className).toContain('min-h-[44px]');
      expect(overviewBtn.className).toContain('min-w-[44px]');
    });
  });
});
