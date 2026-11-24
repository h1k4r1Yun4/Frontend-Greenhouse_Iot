import {
  ActuatorState,
  ChatMessage,
  GatewayData,
  ProposedActuatorAction,
  ZoneData,
} from '../types';
import { loadRuntimeConfig } from '../config/runtimeConfig';
import { getAiService } from './ai';

export interface AssistantResponse {
  text: string;
  proposedAction?: ProposedActuatorAction;
  provider?: string;
}

export class GeminiService {
  async generateResponse(
    userText: string,
    cropKey: string,
    zoneKey: string,
    zones: ZoneData[],
    gateway: GatewayData,
    actuators: ActuatorState[],
    history?: Pick<ChatMessage, 'sender' | 'text'>[]
  ): Promise<AssistantResponse> {
    const config = loadRuntimeConfig();
    const adapter = getAiService(config);
    return adapter.generateResponse({
      message: userText,
      cropKey,
      zoneKey,
      zones,
      gateway,
      actuators,
      history,
    });
  }
}

export const geminiService = new GeminiService();
