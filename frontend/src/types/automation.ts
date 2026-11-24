import { ActuatorType } from './actuator';

export type SensorMetricType = 'temperature' | 'humidity' | 'soilMoisture' | 'lightIntensity';
export type ComparisonOperator = '>' | '<' | '>=' | '<=';

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  targetZone: 'zone1' | 'zone2' | 'all';
  sensorType: SensorMetricType;
  comparison: ComparisonOperator;
  threshold: number;
  hysteresis: number;
  actuatorId: ActuatorType;
  actuatorAction: 'ON' | 'OFF';
  powerLevel?: number;
}
