import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GreenhouseProvider } from '../context/GreenhouseContext';
import { HistoryPage } from '../pages/HistoryPage';

describe('HistoryPage Time-Series Analytics', () => {
  it('renders history chart with zone and time range filters', async () => {
    render(
      <GreenhouseProvider>
        <HistoryPage />
      </GreenhouseProvider>
    );

    expect(screen.getByText(/Lịch Sử Đo Đạc & Phân Tích Biểu Đồ Chuỗi Thời Gian/i)).toBeInTheDocument();
    expect(screen.getByTestId('history-chart-container')).toBeInTheDocument();

    // Check time range buttons
    expect(screen.getByRole('button', { name: /1 Giờ/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /24 Giờ/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /7 Ngày/i })).toBeInTheDocument();

    // Check export CSV button
    const exportBtn = screen.getByRole('button', { name: /Xuất dữ liệu CSV/i });
    expect(exportBtn).toBeInTheDocument();
  });

  it('switches time range and updates query', async () => {
    render(
      <GreenhouseProvider>
        <HistoryPage />
      </GreenhouseProvider>
    );

    const sevenDaysBtn = screen.getByRole('button', { name: /7 Ngày/i });
    fireEvent.click(sevenDaysBtn);

    await waitFor(() => {
      expect(sevenDaysBtn).toHaveClass('bg-emerald-600');
    });
  });
});
