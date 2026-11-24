import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { App } from '../App';
import { ChatMessageItem } from '../components/chatbot/ChatMessageItem';
import { geminiService } from '../services/geminiService';
import { HttpApiClient } from '../services/api/httpApiClient';
import { BackendProxyAiAdapter } from '../services/ai/backendProxyAiAdapter';
import { mockSimulator } from '../services/api/mockSimulator';

describe('Warm Action-First Redesign, Pluggable Adapters & Regression Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSimulator.stop();
    mockSimulator.setEmergencyHalted(false);
    mockSimulator.setOffline(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockSimulator.stop();
    mockSimulator.setEmergencyHalted(false);
    mockSimulator.setOffline(false);
  });

  it('renders ChatMessageItem markdown bold & lists cleanly without raw ** asterisks', () => {
    render(
      <ChatMessageItem
        message={{
          id: 'md-test',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          text: '**Phân tích Nông học:**\n- Nhiệt độ ổn định\n- *Khuyến nghị giữ ẩm*',
        }}
        onRequestConfirm={vi.fn()}
        onReject={vi.fn()}
      />
    );

    const strongEl = screen.getByText('Phân tích Nông học:');
    expect(strongEl.tagName).toBe('STRONG');
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();
    expect(screen.getByText('Nhiệt độ ổn định')).toBeInTheDocument();
  });

  it('prioritizes OFF commands in geminiService ("tắt quạt", "dừng máy bơm")', async () => {
    const fanOff = await geminiService.generateResponse(
      'Hãy tắt quạt thông gió giúp tôi',
      'tomato',
      'zone1',
      mockSimulator.zones,
      mockSimulator.gateway,
      mockSimulator.actuators
    );
    expect(fanOff.proposedAction?.actuatorId).toBe('ventilation_fan');
    expect(fanOff.proposedAction?.action).toBe('OFF');

    const pumpOff = await geminiService.generateResponse(
      'Dừng máy bơm nước ngay',
      'tomato',
      'zone1',
      mockSimulator.zones,
      mockSimulator.gateway,
      mockSimulator.actuators
    );
    expect(pumpOff.proposedAction?.actuatorId).toBe('water_pump');
    expect(pumpOff.proposedAction?.action).toBe('OFF');
  });

  it('persists Global E-Stop interlock across tab navigation and updates telemetry interval in Navbar', async () => {
    render(<App />);

    // Navigate to Controls
    const controlsBtn = screen.getByRole('button', { name: /Điều khiển \(Controls\)/i });
    fireEvent.click(controlsBtn);

    // Update telemetry interval to 15s
    const intervalInput = screen.getByLabelText(/Chu kỳ:/i);
    fireEvent.change(intervalInput, { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /^Gửi$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Chu kỳ 15s/i)).toBeInTheDocument();
    });

    // Trigger E-Stop
    fireEvent.click(screen.getByRole('button', { name: /DỪNG KHẨN CẤP/i }));
    expect(screen.getByText(/Cờ Trạng Thái: EMERGENCY HALTED/i)).toBeInTheDocument();

    // Switch to Dashboard — global emergency banner MUST remain visible
    fireEvent.click(screen.getByRole('button', { name: /Tổng quan \(Dashboard\)/i }));
    expect(screen.getByText(/Trạng thái khóa khẩn cấp: EMERGENCY HALTED/i)).toBeInTheDocument();

    // Re-arm from global banner
    fireEvent.click(screen.getByRole('button', { name: /Khôi phục \(Re-arm\)/i }));
    await waitFor(() => {
      expect(screen.queryByText(/EMERGENCY HALTED/i)).not.toBeInTheDocument();
    });
  });

  it('HttpApiClient and BackendProxyAiAdapter invoke fetch with standardized REST/AI contracts', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        text: 'Nhiệt độ khu 1 đang bình thường.',
        proposedAction: {
          actuatorId: 'ventilation_fan',
          targetZone: 'zone1',
          action: 'ON',
          powerLevel: 75,
          reason: 'Lưu thông khí buổi trưa',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const httpClient = new HttpApiClient({
      apiBaseUrl: 'http://localhost:4000/api',
      authToken: 'demo-token',
    });
    await httpClient.toggleActuator('ventilation_fan', 'ON', 75);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/actuators/ventilation_fan/command',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer demo-token',
        }),
      })
    );

    const aiAdapter = new BackendProxyAiAdapter({
      apiBaseUrl: 'http://localhost:4000/api',
      aiEndpoint: '/ai/chat',
    });
    const aiRes = await aiAdapter.generateResponse({
      message: 'Kiểm tra quạt',
      cropKey: 'tomato',
      zoneKey: 'zone1',
      zones: mockSimulator.zones,
      gateway: mockSimulator.gateway,
      actuators: mockSimulator.actuators,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/ai/chat',
      expect.objectContaining({ method: 'POST' })
    );
    expect(aiRes.proposedAction?.status).toBe('PENDING_CONFIRMATION');
    expect(aiRes.proposedAction?.actuatorId).toBe('ventilation_fan');
  });
});
