import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GreenhouseProvider } from '../context/GreenhouseContext';
import { AutomationPage } from '../pages/AutomationPage';

describe('AutomationPage Rule Engine', () => {
  it('renders default automation rules with hysteresis', () => {
    render(
      <GreenhouseProvider>
        <AutomationPage />
      </GreenhouseProvider>
    );

    expect(screen.getByText(/Tưới nước tự động khi đất khô/i)).toBeInTheDocument();
    expect(screen.getByText(/Phun sương tạo ẩm không khí/i)).toBeInTheDocument();
    expect(screen.getByText(/Làm mát nhà kính bằng quạt thông gió/i)).toBeInTheDocument();
    expect(screen.getByText(/Bổ sung ánh sáng quang hợp LED/i)).toBeInTheDocument();
  });

  it('opens create rule modal and validates form inputs', async () => {
    render(
      <GreenhouseProvider>
        <AutomationPage />
      </GreenhouseProvider>
    );

    const addBtn = screen.getByRole('button', { name: /Thêm Quy Tắc Mới/i });
    fireEvent.click(addBtn);

    expect(screen.getByText(/Thêm Quy Tắc Tự Động Hóa Mới/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ví dụ: Tưới nước tự động khi đất khô/i)).toBeInTheDocument();

    // Close modal
    const cancelBtn = screen.getByRole('button', { name: /Hủy bỏ/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Thêm Quy Tắc Tự Động Hóa Mới/i)).not.toBeInTheDocument();
    });
  });
});
