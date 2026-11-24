import {
  ZoneData,
  ZoneId,
  GatewayData,
  ActuatorState,
  ActuatorType,
  AutomationRule,
  AlertItem,
} from '../../types';

export interface HistoryDataPoint {
  timestamp: string;
  timeLabel: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
}

export interface TelemetryEvent {
  zones: ZoneData[];
  gateway: GatewayData;
  actuators: ActuatorState[];
  alerts: AlertItem[];
  isEmergencyHalted?: boolean;
  telemetryIntervalSeconds?: number;
}

export type TelemetryListener = (event: TelemetryEvent) => void;

export interface ITelemetryStream {
  start(): void;
  stop(): void;
  subscribe(listener: TelemetryListener): () => void;
  setOffline?(offline: boolean): void;
  setIntervalSeconds?(seconds: number): number;
}

export interface HealthCheckResult {
  ok: boolean;
  latencyMs: number;
  mode: 'mock' | 'http';
  message?: string;
}

export interface IApiClient {
  getZones(): Promise<ZoneData[]>;
  getZone(id: ZoneId): Promise<ZoneData | null>;
  getGateway(): Promise<GatewayData>;
  getActuators(): Promise<ActuatorState[]>;
  toggleActuator(id: ActuatorType, action: 'ON' | 'OFF', powerLevel?: number): Promise<ActuatorState>;
  setActuatorPower(id: ActuatorType, powerLevel: number): Promise<ActuatorState>;
  emergencyStop(): Promise<void>;
  rearmSystem(): Promise<void>;
  setTelemetryInterval(seconds: number): Promise<{ intervalSeconds: number }>;
  getRules(): Promise<AutomationRule[]>;
  updateRule(rule: AutomationRule): Promise<AutomationRule>;
  addRule(rule: Omit<AutomationRule, 'id'>): Promise<AutomationRule>;
  deleteRule(id: string): Promise<boolean>;
  toggleRule(id: string): Promise<AutomationRule>;
  getAlerts(): Promise<AlertItem[]>;
  acknowledgeAlert(id: string): Promise<AlertItem>;
  resolveAlert(id: string): Promise<AlertItem>;
  getHistory(zoneId: string, range: '1h' | '24h' | '7d'): Promise<HistoryDataPoint[]>;
  healthCheck(): Promise<HealthCheckResult>;
}
