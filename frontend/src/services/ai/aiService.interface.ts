import {
  ActuatorState,
  ActuatorType,
  ChatMessage,
  GatewayData,
  ProposedActuatorAction,
  ZoneData,
} from '../../types';
import { CROPS } from '../../constants/crops';

export interface AiChatRequest {
  message: string;
  cropKey: string;
  zoneKey: string;
  zones: ZoneData[];
  gateway: GatewayData;
  actuators: ActuatorState[];
  history?: Pick<ChatMessage, 'sender' | 'text'>[];
}

export interface AiChatResponse {
  text: string;
  proposedAction?: ProposedActuatorAction;
  provider?: string;
}

export interface IAiAssistantService {
  readonly providerName: string;
  generateResponse(request: AiChatRequest): Promise<AiChatResponse>;
}

const VALID_ACTUATORS: Record<ActuatorType, string> = {
  water_pump: 'Máy bơm nước tưới gốc',
  mist_spray: 'Hệ thống phun sương tạo ẩm',
  ventilation_fan: 'Quạt thông gió làm mát',
  grow_light: 'Đèn LED chiếu sáng quang hợp',
};

const VALID_ZONES = new Set(['zone1', 'zone2', 'all']);
const VALID_ACTIONS = new Set(['ON', 'OFF', 'SET_POWER']);

export function validateAndNormalizeProposal(raw: unknown): ProposedActuatorAction | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const candidate = raw as Partial<ProposedActuatorAction>;

  if (!candidate.actuatorId || !(candidate.actuatorId in VALID_ACTUATORS)) {
    return undefined;
  }

  const actuatorId = candidate.actuatorId as ActuatorType;
  const action =
    candidate.action && VALID_ACTIONS.has(candidate.action) ? candidate.action : 'ON';
  const targetZone =
    candidate.targetZone && VALID_ZONES.has(candidate.targetZone)
      ? candidate.targetZone
      : 'all';

  let powerLevel: number | undefined;
  if (typeof candidate.powerLevel === 'number' && Number.isFinite(candidate.powerLevel)) {
    powerLevel = Math.max(0, Math.min(100, Math.round(candidate.powerLevel)));
  }

  return {
    id: candidate.id && typeof candidate.id === 'string' ? candidate.id : `prop_${actuatorId}_${Date.now()}`,
    actuatorId,
    actuatorName:
      typeof candidate.actuatorName === 'string' && candidate.actuatorName.trim()
        ? candidate.actuatorName.trim()
        : VALID_ACTUATORS[actuatorId],
    targetZone,
    action,
    powerLevel,
    reason:
      typeof candidate.reason === 'string' && candidate.reason.trim()
        ? candidate.reason.trim()
        : 'Đề xuất tối ưu hóa vi khí hậu dựa trên dữ liệu cảm biến hiện tại.',
    status: 'PENDING_CONFIRMATION',
  };
}

export function parseStructuredProposal(rawText: string): {
  cleanText: string;
  proposedAction?: ProposedActuatorAction;
} {
  const match = rawText.match(/<proposed_action>([\s\S]*?)<\/proposed_action>/i);
  if (!match) {
    return { cleanText: rawText.trim() };
  }

  let proposedAction: ProposedActuatorAction | undefined;
  try {
    const parsed = JSON.parse(match[1].trim());
    proposedAction = validateAndNormalizeProposal(parsed);
  } catch {
    proposedAction = undefined;
  }

  const cleanText = rawText.replace(match[0], '').trim();
  return { cleanText, proposedAction };
}

export function buildAgronomySystemPrompt(req: AiChatRequest): string {
  const crop = CROPS[req.cropKey] || CROPS.tomato;
  const zoneLines = req.zones
    .map(
      (z) =>
        `- ${z.zoneName} (${z.nodeId}): Nhiệt độ ${z.current.temperature}°C, Độ ẩm KK ${z.current.humidity}%, Độ ẩm đất ${z.current.soilMoisture}%`
    )
    .join('\n');

  const actuatorLines = req.actuators
    .map(
      (a) =>
        `- ${a.id} (${a.name}): ${a.isActive ? 'ĐANG BẬT' : 'ĐANG TẮT'}, PWM ${a.powerLevel}%, chế độ ${a.mode}`
    )
    .join('\n');

  return [
    'Bạn là Trợ lý Nông học AI cho Hệ thống Nhà kính Thông minh IoT.',
    'Luôn trả lời bằng tiếng Việt súc tích, chính xác theo số liệu cảm biến thực tế.',
    `Cây trồng đang theo dõi: ${crop.nameVi} (Nhiệt độ chuẩn ${crop.optimalTemp.min}-${crop.optimalTemp.max}°C, Ẩm KK ${crop.optimalHumidity.min}-${crop.optimalHumidity.max}%, Ẩm đất ${crop.optimalSoilMoisture.min}-${crop.optimalSoilMoisture.max}%, Ánh sáng ${crop.optimalLightLux.min}-${crop.optimalLightLux.max} Lux).`,
    `Khu vực ngữ cảnh: ${req.zoneKey}.`,
    'Thông số cảm biến hiện tại:',
    zoneLines,
    `- Gateway ESP32 LDR: ${req.gateway.lightIntensity} Lux (${req.gateway.status})`,
    'Trạng thái 4 thiết bị chấp hành:',
    actuatorLines,
    'Nguyên tắc an toàn: KHÔNG tự động kích hoạt phần cứng. Nếu cần bật/tắt thiết bị, kết thúc phản hồi bằng đúng 1 khối JSON:',
    '<proposed_action>{"actuatorId":"water_pump|mist_spray|ventilation_fan|grow_light","targetZone":"zone1|zone2|all","action":"ON|OFF","powerLevel":80,"reason":"..."}</proposed_action>',
  ].join('\n');
}
