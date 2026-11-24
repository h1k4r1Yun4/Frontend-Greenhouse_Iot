import { ITelemetryStream, TelemetryEvent, TelemetryListener } from './apiClient.interface';

export class WsTelemetryStream implements ITelemetryStream {
  private url: string;
  private ws: WebSocket | null = null;
  private listeners: Set<TelemetryListener> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffMs: number = 1000;
  private manuallyStopped: boolean = false;
  private onConnectionChange?: (connected: boolean) => void;

  constructor(url: string, onConnectionChange?: (connected: boolean) => void) {
    this.url = url;
    this.onConnectionChange = onConnectionChange;
  }

  public start(): void {
    this.manuallyStopped = false;
    this.connect();
  }

  public stop(): void {
    this.manuallyStopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private connect(): void {
    if (this.manuallyStopped || typeof WebSocket === 'undefined') return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.backoffMs = 1000;
        this.onConnectionChange?.(true);
      };

      this.ws.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(String(msg.data)) as TelemetryEvent;
          if (parsed && Array.isArray(parsed.zones) && parsed.gateway && Array.isArray(parsed.actuators)) {
            this.listeners.forEach((listener) => listener(parsed));
          }
        } catch (err) {
          console.error('Invalid telemetry WebSocket payload:', err);
        }
      };

      this.ws.onerror = () => {
        this.onConnectionChange?.(false);
      };

      this.ws.onclose = () => {
        this.onConnectionChange?.(false);
        if (!this.manuallyStopped) {
          const wait = this.backoffMs;
          this.backoffMs = Math.min(15000, this.backoffMs * 2);
          this.reconnectTimer = setTimeout(() => this.connect(), wait);
        }
      };
    } catch {
      this.onConnectionChange?.(false);
    }
  }
}
