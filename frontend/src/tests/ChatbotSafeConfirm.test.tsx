import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GreenhouseProvider } from '../context/GreenhouseContext';
import { ChatbotPage } from '../pages/ChatbotPage';
import { SafeConfirmModal } from '../components/chatbot/SafeConfirmModal';
import { ProposedActuatorAction } from '../types';

describe('AI Chatbot & Mandatory Safe Confirmation Flow', () => {
  it('renders chatbot with crop and zone dropdown selectors', () => {
    render(
      <GreenhouseProvider>
        <ChatbotPage />
      </GreenhouseProvider>
    );

    // Dropdown for crop
    expect(screen.getByLabelText(/Loại cây trồng:/i)).toBeInTheDocument();
    expect(screen.getByText(/Cà chua \(Tomato\)/i)).toBeInTheDocument();

    // Dropdown for zone
    expect(screen.getByLabelText(/Khu vực:/i)).toBeInTheDocument();
    expect(screen.getByText(/Khu vực 1 \(Node 1 - ESP8266\)/i)).toBeInTheDocument();

    // Quick chips
    expect(screen.getByText(/Độ ẩm đất hiện tại có thích hợp cho cà chua không\?/i)).toBeInTheDocument();
  });

  it('NEGATIVE SAFETY FLOW: Clicking Cancel does NOT dispatch command', async () => {
    let confirmed = false;
    let cancelled = false;

    const mockProposal: ProposedActuatorAction = {
      id: 'prop-test-1',
      actuatorId: 'water_pump',
      actuatorName: 'Máy bơm nước tưới gốc',
      targetZone: 'zone1',
      action: 'ON',
      reason: 'Độ ẩm đất đang 32% dưới ngưỡng tối ưu 65%',
      status: 'PENDING_CONFIRMATION',
    };

    render(
      <SafeConfirmModal
        isOpen={true}
        proposal={mockProposal}
        onConfirm={() => {
          confirmed = true;
        }}
        onCancel={() => {
          cancelled = true;
        }}
      />
    );

    // Safety warning is visible
    expect(screen.getByText(/Xác Nhận An Toàn Điều Khiển Phần Cứng/i)).toBeInTheDocument();
    expect(screen.getByText(/Máy bơm nước tưới gốc/i)).toBeInTheDocument();
    expect(screen.getByText(/KÍCH HOẠT \(BẬT\)/i)).toBeInTheDocument();

    // Click "Hủy bỏ (Bỏ qua)"
    const cancelBtn = screen.getByRole('button', { name: /Hủy bỏ/i });
    fireEvent.click(cancelBtn);

    expect(cancelled).toBe(true);
    expect(confirmed).toBe(false);
  });

  it('POSITIVE SAFETY FLOW: Clicking Confirm dispatches hardware command', async () => {
    let confirmed = false;

    const mockProposal: ProposedActuatorAction = {
      id: 'prop-test-2',
      actuatorId: 'ventilation_fan',
      actuatorName: 'Quạt thông gió làm mát',
      targetZone: 'all',
      action: 'ON',
      powerLevel: 85,
      reason: 'Nhiệt độ nhà kính vượt quá 30°C',
      status: 'PENDING_CONFIRMATION',
    };

    render(
      <SafeConfirmModal
        isOpen={true}
        proposal={mockProposal}
        onConfirm={() => {
          confirmed = true;
        }}
        onCancel={() => {}}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /ĐỒNG Ý THỰC THI/i });
    await waitFor(() => {
      fireEvent.click(confirmBtn);
    });

    expect(confirmed).toBe(true);
  });
});
