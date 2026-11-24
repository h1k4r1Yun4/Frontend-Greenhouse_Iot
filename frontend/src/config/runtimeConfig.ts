export type ApiMode = 'mock' | 'http';
export type AiMode = 'mock' | 'backend-proxy' | 'gemini-direct';

export interface RuntimeConfig {
  apiMode: ApiMode;
  apiBaseUrl: string;
  wsUrl: string;
  authToken: string;
  aiMode: AiMode;
  aiEndpoint: string;
  geminiModel: string;
  geminiApiKey: string;
}

const CONFIG_STORAGE_KEY = 'greenhouse_runtime_config_v1';
const SECRET_STORAGE_KEY = 'greenhouse_runtime_secrets_v1';

function readEnv(key: string): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.[key]?.trim() ?? '';
  } catch {
    return '';
  }
}

export function getDefaultRuntimeConfig(): RuntimeConfig {
  const envApiMode = readEnv('VITE_API_MODE');
  const envAiMode = readEnv('VITE_AI_MODE');

  return {
    apiMode: envApiMode === 'http' ? 'http' : 'mock',
    apiBaseUrl: readEnv('VITE_API_BASE_URL') || 'http://localhost:4000/api',
    wsUrl: readEnv('VITE_WS_URL') || 'ws://localhost:4000/ws/greenhouse',
    authToken: '',
    aiMode:
      envAiMode === 'backend-proxy' || envAiMode === 'gemini-direct'
        ? envAiMode
        : 'mock',
    aiEndpoint: readEnv('VITE_AI_ENDPOINT') || '/ai/chat',
    geminiModel: readEnv('VITE_GEMINI_MODEL') || 'gemini-2.5-flash',
    geminiApiKey: '',
  };
}

export function loadRuntimeConfig(): RuntimeConfig {
  const defaults = getDefaultRuntimeConfig();
  if (typeof window === 'undefined') {
    return defaults;
  }

  let savedPublic: Partial<RuntimeConfig> = {};
  let savedSecrets: Partial<RuntimeConfig> = {};

  try {
    const rawPublic = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (rawPublic) {
      savedPublic = JSON.parse(rawPublic) as Partial<RuntimeConfig>;
    }
  } catch {
    savedPublic = {};
  }

  try {
    const rawSecrets = window.sessionStorage.getItem(SECRET_STORAGE_KEY);
    if (rawSecrets) {
      savedSecrets = JSON.parse(rawSecrets) as Partial<RuntimeConfig>;
    }
  } catch {
    savedSecrets = {};
  }

  return {
    ...defaults,
    ...savedPublic,
    ...savedSecrets,
    apiMode: savedPublic.apiMode === 'http' ? 'http' : defaults.apiMode === 'http' && !savedPublic.apiMode ? 'http' : 'mock',
    aiMode:
      savedPublic.aiMode === 'backend-proxy' || savedPublic.aiMode === 'gemini-direct' || savedPublic.aiMode === 'mock'
        ? savedPublic.aiMode
        : defaults.aiMode,
  };
}

export function saveRuntimeConfig(partial: Partial<RuntimeConfig>): RuntimeConfig {
  const merged: RuntimeConfig = {
    ...loadRuntimeConfig(),
    ...partial,
  };

  if (typeof window !== 'undefined') {
    const publicPart = {
      apiMode: merged.apiMode,
      apiBaseUrl: merged.apiBaseUrl.trim(),
      wsUrl: merged.wsUrl.trim(),
      aiMode: merged.aiMode,
      aiEndpoint: merged.aiEndpoint.trim() || '/ai/chat',
      geminiModel: merged.geminiModel.trim() || 'gemini-2.5-flash',
    };

    const secretPart = {
      authToken: merged.authToken.trim(),
      geminiApiKey: merged.geminiApiKey.trim(),
    };

    try {
      window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(publicPart));
      window.sessionStorage.setItem(SECRET_STORAGE_KEY, JSON.stringify(secretPart));
    } catch {
      // Ignore storage quota or sandbox restrictions
    }
  }

  return merged;
}

export function resetRuntimeConfig(): RuntimeConfig {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(CONFIG_STORAGE_KEY);
      window.sessionStorage.removeItem(SECRET_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  return getDefaultRuntimeConfig();
}
