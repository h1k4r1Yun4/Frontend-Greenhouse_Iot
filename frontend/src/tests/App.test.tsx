import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Layout & Shell Integration', () => {
  it('renders application with navbar and sidebar navigation', () => {
    render(<App />);

    // Brand and header title
    expect(screen.getByText(/Greenhouse IoT/i)).toBeInTheDocument();
    expect(screen.getByText(/Hệ thống: Trực tuyến/i)).toBeInTheDocument();

    // Default view is Dashboard
    expect(
      screen.getByText(/Trung Tâm Giám Sát & Điều Hành Nhà Kính IoT/i)
    ).toBeInTheDocument();
  });

  it('toggles online and offline status on connection badge click', () => {
    render(<App />);

    const connectionBtn = screen.getByTestId('connection-status-btn');
    expect(screen.getByText(/Hệ thống: Trực tuyến/i)).toBeInTheDocument();

    // Click to simulate network offline
    fireEvent.click(connectionBtn);
    expect(screen.getByText(/Mất kết nối Gateway!/i)).toBeInTheDocument();

    // Click again to recover
    fireEvent.click(connectionBtn);
    expect(screen.getByText(/Hệ thống: Trực tuyến/i)).toBeInTheDocument();
  });

  it('switches between navigation tabs smoothly', () => {
    render(<App />);

    // Switch to Controls tab
    const controlsBtn = screen.getByRole('button', { name: /Điều khiển \(Controls\)/i });
    fireEvent.click(controlsBtn);
    expect(
      screen.getByText(/Bảng điều khiển trung tâm/i)
    ).toBeInTheDocument();

    // Switch to Automation tab
    const autoBtn = screen.getByRole('button', { name: /Tự động hóa \(Automation\)/i });
    fireEvent.click(autoBtn);
    expect(
      screen.getByText(/Kịch Bản & Quy Tắc Tự Động Hóa Vi Khí Hậu/i)
    ).toBeInTheDocument();

    // Switch to Alerts tab
    const alertsBtn = screen.getByRole('button', { name: /Cảnh báo \(Alerts\)/i });
    fireEvent.click(alertsBtn);
    expect(
      screen.getByText(/Trung Tâm Cảnh Báo & Nhật Ký Sự Cố Hệ Thống/i)
    ).toBeInTheDocument();

    // Switch to History tab
    const historyBtn = screen.getByRole('button', { name: /Lịch sử & Biểu đồ/i });
    fireEvent.click(historyBtn);
    expect(
      screen.getByText(/Lịch Sử Đo Đạc & Phân Tích Biểu Đồ Chuỗi Thời Gian/i)
    ).toBeInTheDocument();

    // Switch to Chatbot tab
    const chatBtn = screen.getByRole('button', { name: /Trợ lý AI Gemini/i });
    fireEvent.click(chatBtn);
    expect(
      screen.getByText(/Trợ Lý Trí Tuệ Nhân Tạo Google Gemini/i)
    ).toBeInTheDocument();
  });
});
