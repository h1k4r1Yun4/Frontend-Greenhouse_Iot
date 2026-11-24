import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GreenhouseProvider, useGreenhouse } from '../context/GreenhouseContext';
import { ChatWindow } from '../components/chatbot/ChatWindow';
import { Navbar } from '../components/layout/Navbar';
import { mockApiClient } from '../services/api/mockApiClient';
import { mockSimulator } from '../services/api/mockSimulator';

describe('Adversarial Verification: Safety Invariants & Boundary Conditions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Safety Constraint 1: Chatbot Proposed Action Rejection Guarantee', () => {
    it('NEGATIVE VERIFICATION: Rejecting proposal via ActionProposalCard "Từ chối" sends NO command and preserves actuator state', async () => {
      const toggleSpy = vi.spyOn(mockApiClient, 'toggleActuator');

      // Check initial pump state in simulator
      const initialPump = mockSimulator.actuators.find((a) => a.id === 'water_pump');
      const initialPumpState = initialPump ? initialPump.isActive : false;

      render(
        <GreenhouseProvider>
          <ChatWindow />
        </GreenhouseProvider>
      );

      // Trigger user question to prompt AI actuator proposal
      const input = screen.getByPlaceholderText(/Hỏi trợ lý AI về tưới nước/i);
      fireEvent.change(input, { target: { value: 'Tưới nước cho cà chua ngay bây giờ' } });

      const sendBtn = screen.getByLabelText(/Gửi tin nhắn/i);
      fireEvent.click(sendBtn);

      // Wait for AI proposal card to appear
      await waitFor(
        () => {
          expect(screen.getByText(/ĐỀ XUẤT ĐIỀU KHIỂN THIẾT BỊ TỪ AI/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(screen.getByText(/Chờ xác nhận/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Từ chối/i })).toBeInTheDocument();

      // Click "Từ chối"
      const rejectBtn = screen.getByRole('button', { name: /Từ chối/i });
      fireEvent.click(rejectBtn);

      // Verify UI reflects rejection
      await waitFor(() => {
        expect(screen.getByText(/Đã từ chối/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Người dùng đã hủy bỏ đề xuất này\. Thiết bị giữ nguyên trạng thái\./i)
        ).toBeInTheDocument();
      });

      // Verify EMPIRICAL SAFETY INVARIANT:
      // 1. mockApiClient.toggleActuator was NEVER called
      expect(toggleSpy).not.toHaveBeenCalled();

      // 2. Actuator state remains strictly unchanged
      const currentPump = mockSimulator.actuators.find((a) => a.id === 'water_pump');
      expect(currentPump?.isActive).toBe(initialPumpState);

      toggleSpy.mockRestore();
    });

    it('NEGATIVE VERIFICATION: Opening SafeConfirmModal and clicking "Hủy bỏ (Bỏ qua)" sends NO command', async () => {
      const toggleSpy = vi.spyOn(mockApiClient, 'toggleActuator');

      render(
        <GreenhouseProvider>
          <ChatWindow />
        </GreenhouseProvider>
      );

      // Ask for misting or irrigation to get proposal
      const input = screen.getByPlaceholderText(/Hỏi trợ lý AI về tưới nước/i);
      fireEvent.change(input, { target: { value: 'Bật máy bơm nước tưới cà chua' } });
      fireEvent.click(screen.getByLabelText(/Gửi tin nhắn/i));

      await waitFor(
        () => {
          expect(screen.getByText(/ĐỀ XUẤT ĐIỀU KHIỂN THIẾT BỊ TỪ AI/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Click "Xác nhận Điều khiển" to trigger 2-Step Confirmation Modal
      const openModalBtn = screen.getByRole('button', { name: /Xác nhận Điều khiển/i });
      fireEvent.click(openModalBtn);

      // Modal is open
      await waitFor(() => {
        expect(screen.getByText(/Xác Nhận An Toàn Điều Khiển Phần Cứng \(2-Step Safety\)/i)).toBeInTheDocument();
      });

      // Click "Hủy bỏ (Bỏ qua)"
      const cancelBtn = screen.getByRole('button', { name: /Hủy bỏ \(Bỏ qua\)/i });
      fireEvent.click(cancelBtn);

      // Modal closes
      await waitFor(() => {
        expect(
          screen.queryByText(/Xác Nhận An Toàn Điều Khiển Phần Cứng \(2-Step Safety\)/i)
        ).not.toBeInTheDocument();
      });

      // INVARIANT: toggleActuator was NEVER invoked
      expect(toggleSpy).not.toHaveBeenCalled();

      toggleSpy.mockRestore();
    });
  });

  describe('Boundary Condition 2: Online / Offline Network Status Reactivity', () => {
    // Test component to read context status directly
    const NetworkStatusConsumer = () => {
      const { connectionStatus } = useGreenhouse();
      return <div data-testid="context-status">{connectionStatus}</div>;
    };

    it('toggles from Online to Offline and updates UI badge & context state', async () => {
      render(
        <GreenhouseProvider>
          <Navbar />
          <NetworkStatusConsumer />
        </GreenhouseProvider>
      );

      // Initially online
      expect(screen.getByText(/Hệ thống: Trực tuyến/i)).toBeInTheDocument();
      expect(screen.getByTestId('context-status').textContent).toBe('online');

      const connectionBtn = screen.getByTestId('connection-status-btn');

      // Click to toggle to offline
      fireEvent.click(connectionBtn);

      expect(screen.getByText(/Mất kết nối Gateway!/i)).toBeInTheDocument();
      expect(screen.getByTestId('context-status').textContent).toBe('offline');

      // Click to toggle back to online
      fireEvent.click(connectionBtn);

      expect(screen.getByText(/Hệ thống: Trực tuyến/i)).toBeInTheDocument();
      expect(screen.getByTestId('context-status').textContent).toBe('online');
    });

    it('STRESS TEST: Rapid alternating toggles remain consistent and deterministic', async () => {
      render(
        <GreenhouseProvider>
          <Navbar />
          <NetworkStatusConsumer />
        </GreenhouseProvider>
      );

      const connectionBtn = screen.getByTestId('connection-status-btn');

      // Rapidly click 9 times (odd number -> ends in offline)
      for (let i = 0; i < 9; i++) {
        fireEvent.click(connectionBtn);
      }

      expect(screen.getByText(/Mất kết nối Gateway!/i)).toBeInTheDocument();
      expect(screen.getByTestId('context-status').textContent).toBe('offline');

      // Click 1 more time (10th click -> even number -> ends in online)
      fireEvent.click(connectionBtn);

      expect(screen.getByText(/Hệ thống: Trực tuyến/i)).toBeInTheDocument();
      expect(screen.getByTestId('context-status').textContent).toBe('online');
    });
  });
});
