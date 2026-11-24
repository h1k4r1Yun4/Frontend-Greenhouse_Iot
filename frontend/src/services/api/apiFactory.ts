import { RuntimeConfig } from '../../config/runtimeConfig';
import { IApiClient, ITelemetryStream } from './apiClient.interface';
import { mockApiClient } from './mockApiClient';
import { mockSimulator } from './mockSimulator';
import { HttpApiClient } from './httpApiClient';
import { WsTelemetryStream } from './wsTelemetryStream';

export function getApiClient(config: RuntimeConfig): IApiClient {
  if (config.apiMode === 'http' && config.apiBaseUrl) {
    return new HttpApiClient({
      apiBaseUrl: config.apiBaseUrl,
      authToken: config.authToken,
    });
  }
  return mockApiClient;
}

export function createTelemetryStream(
  config: RuntimeConfig,
  onConnectionChange?: (connected: boolean) => void
): ITelemetryStream {
  if (config.apiMode === 'http' && config.wsUrl) {
    return new WsTelemetryStream(config.wsUrl, onConnectionChange);
  }
  return mockSimulator;
}
