import {
  ZoneData,
  ZoneId,
  GatewayData,
  ActuatorState,
  ActuatorType,
  AutomationRule,
  AlertItem,
} from '../../types';
import { IApiClient, HistoryDataPoint, HealthCheckResult } from './apiClient.interface';
import { mockSimulator } from './mockSimulator';

const delay = (ms: number = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockApiClient implements IApiClient {
  async getZones(): Promise<ZoneData[]> {
    await delay();
    return JSON.parse(JSON.stringify(mockSimulator.zones));
  }

  async getZone(id: ZoneId): Promise<ZoneData | null> {
    await delay();
    const zone = mockSimulator.zones.find((z) => z.zoneId === id);
    return zone ? JSON.parse(JSON.stringify(zone)) : null;
  }

  async getGateway(): Promise<GatewayData> {
    await delay();
    return {
      ...mockSimulator.gateway,
      history: [...(mockSimulator.gateway.history || [])],
    };
  }

  async getActuators(): Promise<ActuatorState[]> {
    await delay();
    return JSON.parse(JSON.stringify(mockSimulator.actuators));
  }

  async toggleActuator(
    id: ActuatorType,
    action: 'ON' | 'OFF',
    powerLevel?: number
  ): Promise<ActuatorState> {
    await delay(120);
    return mockSimulator.setActuator(id, action, powerLevel);
  }

  async setActuatorPower(id: ActuatorType, powerLevel: number): Promise<ActuatorState> {
    await delay(100);
    const act = mockSimulator.actuators.find((a) => a.id === id);
    if (!act) throw new Error(`Actuator ${id} not found`);
    return mockSimulator.setActuator(id, act.isActive ? 'ON' : 'OFF', powerLevel);
  }

  async emergencyStop(): Promise<void> {
    mockSimulator.emergencyStop();
  }

  async rearmSystem(): Promise<void> {
    mockSimulator.rearmSystem();
  }

  async setTelemetryInterval(seconds: number): Promise<{ intervalSeconds: number }> {
    await delay(80);
    const intervalSeconds = mockSimulator.setIntervalSeconds(seconds);
    return { intervalSeconds };
  }

  async getRules(): Promise<AutomationRule[]> {
    await delay();
    return JSON.parse(JSON.stringify(mockSimulator.rules));
  }

  async updateRule(rule: AutomationRule): Promise<AutomationRule> {
    await delay(120);
    const idx = mockSimulator.rules.findIndex((r) => r.id === rule.id);
    if (idx !== -1) {
      mockSimulator.rules[idx] = { ...rule };
    } else {
      mockSimulator.rules.push({ ...rule });
    }
    return { ...rule };
  }

  async addRule(ruleData: Omit<AutomationRule, 'id'>): Promise<AutomationRule> {
    await delay(120);
    const newRule: AutomationRule = {
      ...ruleData,
      id: `rule_${Date.now()}`,
    };
    mockSimulator.rules.push(newRule);
    return newRule;
  }

  async deleteRule(id: string): Promise<boolean> {
    await delay(100);
    const before = mockSimulator.rules.length;
    mockSimulator.rules = mockSimulator.rules.filter((r) => r.id !== id);
    return mockSimulator.rules.length < before;
  }

  async toggleRule(id: string): Promise<AutomationRule> {
    await delay(80);
    const target = mockSimulator.rules.find((r) => r.id === id);
    if (!target) throw new Error(`Rule ${id} not found`);
    target.enabled = !target.enabled;
    return { ...target };
  }

  async getAlerts(): Promise<AlertItem[]> {
    await delay();
    return JSON.parse(JSON.stringify(mockSimulator.alerts));
  }

  async acknowledgeAlert(id: string): Promise<AlertItem> {
    await delay(100);
    const alert = mockSimulator.alerts.find((a) => a.id === id);
    if (!alert) throw new Error(`Alert ${id} not found`);
    alert.acknowledged = true;
    return { ...alert };
  }

  async resolveAlert(id: string): Promise<AlertItem> {
    await delay(100);
    const alert = mockSimulator.alerts.find((a) => a.id === id);
    if (!alert) throw new Error(`Alert ${id} not found`);
    alert.acknowledged = true;
    alert.resolved = true;
    return { ...alert };
  }

  async getHistory(
    zoneId: string,
    range: '1h' | '24h' | '7d'
  ): Promise<HistoryDataPoint[]> {
    await delay(120);
    const now = Date.now();
    const pointsCount = range === '1h' ? 12 : range === '24h' ? 24 : 14;
    const intervalMs =
      range === '1h'
        ? 5 * 60 * 1000
        : range === '24h'
        ? 60 * 60 * 1000
        : 12 * 60 * 60 * 1000;

    const isZone2 = zoneId === 'zone2';
    const baseTemp = isZone2 ? 18.5 : 25.0;
    const baseHum = isZone2 ? 64.0 : 68.0;
    const baseSoil = isZone2 ? 65.0 : 72.0;

    const data: HistoryDataPoint[] = [];

    for (let i = pointsCount; i >= 0; i--) {
      const pointTime = new Date(now - i * intervalMs);
      const hour = pointTime.getHours();
      const minute = pointTime.getMinutes();

      const dayFactor = Math.sin(((hour - 6) / 24) * 2 * Math.PI);
      const temp = Number((baseTemp + dayFactor * 3.5 + Math.sin(i) * 0.8).toFixed(1));
      const hum = Number((baseHum - dayFactor * 5.0 + Math.cos(i) * 1.5).toFixed(1));
      const soil = Number((baseSoil - (i % 6) * 1.5 + (i % 4) * 0.8).toFixed(1));
      const light = Math.max(
        0,
        Math.round(hour >= 6 && hour <= 18 ? 400 + dayFactor * 450 + (i % 5) * 30 : 20 + (i % 3) * 10)
      );

      let timeLabel = '';
      if (range === '1h') {
        timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      } else if (range === '24h') {
        timeLabel = `${String(hour).padStart(2, '0')}:00`;
      } else {
        timeLabel = `${pointTime.getDate()}/${pointTime.getMonth() + 1} ${String(hour).padStart(2, '0')}h`;
      }

      data.push({
        timestamp: pointTime.toISOString(),
        timeLabel,
        temperature: Math.max(10, Math.min(45, temp)),
        humidity: Math.max(20, Math.min(95, hum)),
        soilMoisture: Math.max(15, Math.min(95, soil)),
        lightIntensity: light,
      });
    }

    return data;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    await delay(40);
    return {
      ok: !mockSimulator.isOffline,
      latencyMs: 12,
      mode: 'mock',
      message: mockSimulator.isOffline
        ? 'Bộ mô phỏng đang đặt ở chế độ mất kết nối (Offline).'
        : 'Bộ mô phỏng nội bộ hoạt động ổn định.',
    };
  }
}

export const mockApiClient = new MockApiClient();
