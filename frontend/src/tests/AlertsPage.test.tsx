import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GreenhouseProvider } from '../context/GreenhouseContext';
import { AlertsPage } from '../pages/AlertsPage';

describe('AlertsPage Incident Management', () => {
  it('renders alerts and filters by severity levels', async () => {
    render(
      <GreenhouseProvider>
        <AlertsPage />
      </GreenhouseProvider>
    );

    // Initial alerts
    expect(screen.getByText(/Trung Tâm Cảnh Báo & Nhật Ký Sự Cố Hệ Thống/i)).toBeInTheDocument();
    expect(screen.getByText(/Độ ẩm đất Khu 1 chạm ngưỡng thấp 38%/i)).toBeInTheDocument();

    // Filter by Critical tab
    const criticalTab = screen.getByRole('button', { name: 'Nguy hiểm' });
    fireEvent.click(criticalTab);

    // Filter by Warning tab
    const warningTab = screen.getByRole('button', { name: 'Cảnh báo' });
    fireEvent.click(warningTab);
    expect(screen.getByText(/Độ ẩm đất Khu 1 chạm ngưỡng thấp 38%/i)).toBeInTheDocument();
  });

  it('marks alert as acknowledged', async () => {
    render(
      <GreenhouseProvider>
        <AlertsPage />
      </GreenhouseProvider>
    );

    const ackBtn = screen.getByRole('button', { name: /Đã xem/i });
    expect(ackBtn).toBeInTheDocument();

    fireEvent.click(ackBtn);

    await waitFor(() => {
      // Button disappears once acknowledged
      expect(screen.queryByRole('button', { name: /Đã xem/i })).not.toBeInTheDocument();
    });
  });
});
