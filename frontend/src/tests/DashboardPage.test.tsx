import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GreenhouseProvider } from '../context/GreenhouseContext';
import { DashboardPage } from '../pages/DashboardPage';

describe('DashboardPage Real-time Monitoring', () => {
  it('renders telemetry metrics for Zone 1, Zone 2, and Gateway ESP32', () => {
    render(
      <GreenhouseProvider>
        <DashboardPage />
      </GreenhouseProvider>
    );

    // Zone 1 checks
    expect(screen.getByText(/Khu vực 1 \(Node 1 - ESP8266\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Cây trồng: Cà chua/i)).toBeInTheDocument();

    // Zone 2 checks
    expect(screen.getByText(/Khu vực 2 \(Node 2 - ESP8266\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Cây trồng: Rau xà lách/i)).toBeInTheDocument();

    // Gateway LDR checks
    expect(screen.getByText(/Trạm Gateway ESP32 Trung tâm/i)).toBeInTheDocument();
    expect(screen.getByText(/Cường độ ánh sáng \(LDR Sensor\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lux/i).length).toBeGreaterThan(0);

    // 4 Actuators status check
    expect(screen.getByText(/Máy bơm nước tưới gốc/i)).toBeInTheDocument();
    expect(screen.getByText(/Hệ thống phun sương tạo ẩm/i)).toBeInTheDocument();
    expect(screen.getByText(/Quạt thông gió làm mát/i)).toBeInTheDocument();
    expect(screen.getByText(/Đèn LED chiếu sáng quang hợp/i)).toBeInTheDocument();
  });
});
