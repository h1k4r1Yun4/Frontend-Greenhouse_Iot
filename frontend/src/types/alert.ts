export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertItem {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  zoneId: 'zone1' | 'zone2' | 'gateway' | 'system';
  message: string;
  source: string;
  resolved: boolean;
  acknowledged: boolean;
}
