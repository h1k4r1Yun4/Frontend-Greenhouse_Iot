import {
  AiChatRequest,
  AiChatResponse,
  IAiAssistantService,
  parseStructuredProposal,
  validateAndNormalizeProposal,
} from './aiService.interface';

export interface BackendProxyAiOptions {
  apiBaseUrl: string;
  aiEndpoint: string;
  authToken?: string;
}

export class BackendProxyAiAdapter implements IAiAssistantService {
  public readonly providerName = 'Backend AI Proxy';
  private endpointUrl: string;
  private authToken?: string;

  constructor(options: BackendProxyAiOptions) {
    const cleanEndpoint = options.aiEndpoint.trim() || '/ai/chat';
    if (/^https?:\/\//i.test(cleanEndpoint)) {
      this.endpointUrl = cleanEndpoint;
    } else {
      const base = options.apiBaseUrl.replace(/\/+$/, '');
      const suffix = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
      this.endpointUrl = `${base}${suffix}`;
    }
    this.authToken = options.authToken?.trim() || undefined;
  }

  async generateResponse(req: AiChatRequest): Promise<AiChatResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      const res = await fetch(this.endpointUrl, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          message: req.message,
          cropContext: req.cropKey,
          zoneContext: req.zoneKey,
          telemetry: {
            zones: req.zones,
            gateway: req.gateway,
            actuators: req.actuators,
          },
          history: req.history ?? [],
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${msg ? `: ${msg.slice(0, 140)}` : ''}`);
      }

      const data = (await res.json()) as {
        text?: string;
        reply?: string;
        proposedAction?: unknown;
      };

      const rawText = data.text ?? data.reply ?? 'Không nhận được nội dung phản hồi từ Backend AI.';
      const parsed = parseStructuredProposal(rawText);
      const proposedAction =
        validateAndNormalizeProposal(data.proposedAction) ?? parsed.proposedAction;

      return {
        provider: this.providerName,
        text: parsed.cleanText || rawText,
        proposedAction,
      };
    } catch (err) {
      const reason =
        (err as Error)?.name === 'AbortError'
          ? 'Hết thời gian chờ phản hồi từ Backend AI (15s).'
          : (err as Error)?.message || 'Lỗi kết nối tới Backend AI Proxy.';
      return {
        provider: this.providerName,
        text: `**Không thể kết nối Backend AI Proxy:** ${reason}\nVui lòng kiểm tra máy chủ Backend tại \`${this.endpointUrl}\` hoặc chuyển về chế độ Mock trong mục **Cấu hình Backend & AI**.`,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
