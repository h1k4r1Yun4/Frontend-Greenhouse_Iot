import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GreenhouseProvider } from '../context/GreenhouseContext';
import { ControlsPage } from '../pages/ControlsPage';

describe('ControlsPage Hardware Actuation', () => {
  it('renders 4 hardware actuators and toggles state', async () => {
    render(
      <GreenhouseProvider>
        <ControlsPage />
      </GreenhouseProvider>
    );

    expect(screen.getByText(/Máy bơm nước tưới gốc/i)).toBeInTheDocument();
    expect(screen.getByText(/Hệ thống phun sương tạo ẩm/i)).toBeInTheDocument();
    expect(screen.getByText(/Quạt thông gió làm mát/i)).toBeInTheDocument();
    expect(screen.getByText(/Đèn LED chiếu sáng quang hợp/i)).toBeInTheDocument();

    // Toggle water pump
    const pumpToggleBtn = screen.getByRole('button', { name: /Bật tắt Máy bơm nước tưới gốc/i });
    expect(pumpToggleBtn).toBeInTheDocument();

    fireEvent.click(pumpToggleBtn);

    await waitFor(() => {
      expect(screen.getByText(/ĐANG BẬT/i)).toBeInTheDocument();
    });
  });

  it('triggers emergency stop button to safely shut down actuators', async () => {
    render(
      <GreenhouseProvider>
        <ControlsPage />
      </GreenhouseProvider>
    );

    const emgBtn = screen.getByRole('button', { name: /DỪNG KHẨN CẤP/i });
    expect(emgBtn).toBeInTheDocument();

    fireEvent.click(emgBtn);

    // All should be off
    await waitFor(() => {
      const activeTags = screen.queryAllByText('ĐANG BẬT');
      expect(activeTags.length).toBe(0);
    });
  });
});
