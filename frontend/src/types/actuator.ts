export type ActuatorType = 'water_pump' | 'mist_spray' | 'ventilation_fan' | 'grow_light';
export type ControlMode = 'manual' | 'auto';

export interface ActuatorState {
  id: ActuatorType;
  name: string;
  targetZone: 'zone1' | 'zone2' | 'all';
  isActive: boolean;
  powerLevel: number; // 0 - 100 (PWM for fan and LED light)
  mode: ControlMode;
  lastUpdated: string;
  driverType: 'relay' | 'pwm';
}

export interface ActuatorCommand {
  actuatorId: ActuatorType;
  action: 'ON' | 'OFF' | 'SET_POWER';
  powerLevel?: number;
  initiatedBy: 'user' | 'automation' | 'chatbot';
  confirmedByUser: boolean;
}
