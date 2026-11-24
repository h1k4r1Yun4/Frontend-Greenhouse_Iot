import { RuntimeConfig } from '../../config/runtimeConfig';
import { IAiAssistantService } from './aiService.interface';
import { MockAiAdapter } from './mockAiAdapter';
import { BackendProxyAiAdapter } from './backendProxyAiAdapter';
import { GeminiDirectAiAdapter } from './geminiDirectAiAdapter';

export * from './aiService.interface';
export * from './mockAiAdapter';
export * from './backendProxyAiAdapter';
export * from './geminiDirectAiAdapter';

const mockAiAdapter = new MockAiAdapter();

export function getAiService(config: RuntimeConfig): IAiAssistantService {
  if (config.aiMode === 'backend-proxy') {
    return new BackendProxyAiAdapter({
      apiBaseUrl: config.apiBaseUrl,
      aiEndpoint: config.aiEndpoint,
      authToken: config.authToken,
    });
  }

  if (config.aiMode === 'gemini-direct') {
    return new GeminiDirectAiAdapter({
      apiKey: config.geminiApiKey,
      model: config.geminiModel,
    });
  }

  return mockAiAdapter;
}
