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

export interface HttpApiClientOptions {
  apiBaseUrl: string;
  authToken?: string;
  timeoutMs?: number;
}

export class HttpApiClient implements IApiClient {
  private baseUrl: string;
  private authToken?: string;
  private timeoutMs: number;

  constructor(options: HttpApiClientOptions) {
    this.baseUrl = options.apiBaseUrl.replace(/\/+$/, '');
    this.authToken = options.authToken?.trim() || undefined;
    this.timeoutMs = options.timeoutMs ?? 10000;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
      };

      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(
          `Backend HTTP ${response.status}${errBody ? `: ${errBody.slice(0, 160)}` : ''}`
        );
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        throw new Error(`Hết thời gian chờ kết nối Backend (${this.timeoutMs}ms).`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  getZones(): Promise<ZoneData[]> {
    return this.request<ZoneData[]>('/zones');
  }

  getZone(id: ZoneId): Promise<ZoneData | null> {
    return this.request<ZoneData | null>(`/zones/${encodeURIComponent(id)}`);
  }

  getGateway(): Promise<GatewayData> {
    return this.request<GatewayData>('/gateway');
  }

  getActuators(): Promise<ActuatorState[]> {
    return this.request<ActuatorState[]>('/actuators');
  }

  toggleActuator(
    id: ActuatorType,
    action: 'ON' | 'OFF',
    powerLevel?: number
  ): Promise<ActuatorState> {
    return this.request<ActuatorState>(`/actuators/${encodeURIComponent(id)}/command`, {
      method: 'POST',
      body: JSON.stringify({ action, powerLevel }),
    });
  }

  setActuatorPower(id: ActuatorType, powerLevel: number): Promise<ActuatorState> {
    return this.request<ActuatorState>(`/actuators/${encodeURIComponent(id)}/power`, {
      method: 'PATCH',
      body: JSON.stringify({ powerLevel }),
    });
  }

  emergencyStop(): Promise<void> {
    return this.request<void>('/system/emergency-stop', { method: 'POST' });
  }

  rearmSystem(): Promise<void> {
    return this.request<void>('/system/rearm', { method: 'POST' });
  }

  setTelemetryInterval(seconds: number): Promise<{ intervalSeconds: number }> {
    return this.request<{ intervalSeconds: number }>('/system/telemetry-interval', {
      method: 'PUT',
      body: JSON.stringify({ intervalSeconds: seconds }),
    });
  }

  getRules(): Promise<AutomationRule[]> {
    return this.request<AutomationRule[]>('/rules');
  }

  updateRule(rule: AutomationRule): Promise<AutomationRule> {
    return this.request<AutomationRule>(`/rules/${encodeURIComponent(rule.id)}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    });
  }

  addRule(rule: Omit<AutomationRule, 'id'>): Promise<AutomationRule> {
    return this.request<AutomationRule>('/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async deleteRule(id: string): Promise<boolean> {
    const res = await this.request<{ deleted?: boolean }>(`/rules/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res?.deleted ?? true;
  }

  toggleRule(id: string): Promise<AutomationRule> {
    return this.request<AutomationRule>(`/rules/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
    });
  }

  getAlerts(): Promise<AlertItem[]> {
    return this.request<AlertItem[]>('/alerts');
  }

  acknowledgeAlert(id: string): Promise<AlertItem> {
    return this.request<AlertItem>(`/alerts/${encodeURIComponent(id)}/acknowledge`, {
      method: 'PATCH',
    });
  }

  resolveAlert(id: string): Promise<AlertItem> {
    return this.request<AlertItem>(`/alerts/${encodeURIComponent(id)}/resolve`, {
      method: 'PATCH',
    });
  }

  getHistory(zoneId: string, range: '1h' | '24h' | '7d'): Promise<HistoryDataPoint[]> {
    const query = new URLSearchParams({ zoneId, range }).toString();
    return this.request<HistoryDataPoint[]>(`/history?${query}`);
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const started = Date.now();
    try {
      await this.request<{ status?: string }>('/health');
      return {
        ok: true,
        latencyMs: Date.now() - started,
        mode: 'http',
        message: 'Đã kết nối thành công tới Backend API.',
      };
    } catch (err) {
      return {
        ok: false,
        latencyMs: Date.now() - started,
        mode: 'http',
        message: (err as Error)?.message || 'Không thể kết nối Backend API.',
      };
    }
  }
}
