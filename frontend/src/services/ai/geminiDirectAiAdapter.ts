import {
  AiChatRequest,
  AiChatResponse,
  IAiAssistantService,
  buildAgronomySystemPrompt,
  parseStructuredProposal,
} from './aiService.interface';

export interface GeminiDirectAiOptions {
  apiKey: string;
  model?: string;
}

export class GeminiDirectAiAdapter implements IAiAssistantService {
  public readonly providerName = 'Google Gemini API';
  private apiKey: string;
  private model: string;

  constructor(options: GeminiDirectAiOptions) {
    this.apiKey = options.apiKey.trim();
    this.model = options.model?.trim() || 'gemini-2.5-flash';
  }

  async generateResponse(req: AiChatRequest): Promise<AiChatResponse> {
    if (!this.apiKey) {
      return {
        provider: this.providerName,
        text: '**Chưa cấu hình Gemini API Key:** Vui lòng nhập API Key trong mục **Cấu hình AI** hoặc chuyển sang chế độ **Backend AI Proxy** / **Mock AI**.',
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.model
    )}:generateContent`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildAgronomySystemPrompt(req) }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: req.message }],
            },
          ],
          generationConfig: {
            temperature: 0.35,
          },
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${msg ? `: ${msg.slice(0, 140)}` : ''}`);
      }

      const data = (await res.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };

      const rawText =
        data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') ||
        'Gemini không trả về nội dung phản hồi.';

      const { cleanText, proposedAction } = parseStructuredProposal(rawText);

      return {
        provider: this.providerName,
        text: cleanText || rawText,
        proposedAction,
      };
    } catch (err) {
      const reason =
        (err as Error)?.name === 'AbortError'
          ? 'Hết thời gian chờ phản hồi từ Gemini API (15s).'
          : (err as Error)?.message || 'Không thể kết nối tới Google Gemini API.';
      return {
        provider: this.providerName,
        text: `**Lỗi gọi Google Gemini API:** ${reason}\nBạn có thể kiểm tra lại API Key hoặc chuyển về chế độ Mock/Backend Proxy trong **Cấu hình AI**.`,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
