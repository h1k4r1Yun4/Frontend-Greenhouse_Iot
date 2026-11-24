import { ActuatorType } from './actuator';

export interface ProposedActuatorAction {
  id: string;
  actuatorId: ActuatorType;
  actuatorName: string;
  targetZone: 'zone1' | 'zone2' | 'all';
  action: 'ON' | 'OFF' | 'SET_POWER';
  powerLevel?: number;
  reason: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  cropContext?: string;
  zoneContext?: 'zone1' | 'zone2' | 'all';
  proposedAction?: ProposedActuatorAction;
}
