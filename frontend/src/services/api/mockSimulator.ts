import {
  ZoneData,
  GatewayData,
  ActuatorState,
  AlertItem,
  AutomationRule,
} from '../../types';
import { DEFAULT_AUTOMATION_RULES } from '../../constants/defaultRules';
import { ITelemetryStream, TelemetryEvent, TelemetryListener } from './apiClient.interface';

export type { TelemetryEvent, TelemetryListener };

class MockSimulator implements ITelemetryStream {
  private timer: ReturnType<typeof setInterval> | null = null;
  private intervalMs: number = 5000;
  private listeners: Set<TelemetryListener> = new Set();
  public isEmergencyHalted: boolean = false;
  public isOffline: boolean = false;

  public zones: ZoneData[] = [
    {
      zoneId: 'zone1',
      zoneName: 'Khu vực 1 (Node 1 - ESP8266)',
      cropType: 'tomato',
      nodeId: 'ESP8266_NODE_1',
      status: 'online',
      current: {
        temperature: 25.2,
        humidity: 68.0,
        soilMoisture: 72.0,
        timestamp: new Date().toISOString(),
      },
      history: [],
    },
    {
      zoneId: 'zone2',
      zoneName: 'Khu vực 2 (Node 2 - ESP8266)',
      cropType: 'lettuce',
      nodeId: 'ESP8266_NODE_2',
      status: 'online',
      current: {
        temperature: 18.6,
        humidity: 64.0,
        soilMoisture: 66.0,
        timestamp: new Date().toISOString(),
      },
      history: [],
    },
  ];

  public gateway: GatewayData = {
    gatewayId: 'ESP32_GATEWAY',
    status: 'online',
    lightIntensity: 620,
    history: [],
    timestamp: new Date().toISOString(),
  };

  public actuators: ActuatorState[] = [
    {
      id: 'water_pump',
      name: 'Máy bơm nước tưới gốc',
      targetZone: 'all',
      isActive: false,
      powerLevel: 100,
      mode: 'auto',
      lastUpdated: new Date().toISOString(),
      driverType: 'relay',
    },
    {
      id: 'mist_spray',
      name: 'Hệ thống phun sương tạo ẩm',
      targetZone: 'all',
      isActive: false,
      powerLevel: 100,
      mode: 'auto',
      lastUpdated: new Date().toISOString(),
      driverType: 'relay',
    },
    {
      id: 'ventilation_fan',
      name: 'Quạt thông gió làm mát',
      targetZone: 'all',
      isActive: false,
      powerLevel: 70,
      mode: 'auto',
      lastUpdated: new Date().toISOString(),
      driverType: 'pwm',
    },
    {
      id: 'grow_light',
      name: 'Đèn LED chiếu sáng quang hợp',
      targetZone: 'all',
      isActive: false,
      powerLevel: 80,
      mode: 'auto',
      lastUpdated: new Date().toISOString(),
      driverType: 'pwm',
    },
  ];

  public rules: AutomationRule[] = [...DEFAULT_AUTOMATION_RULES];

  public alerts: AlertItem[] = [
    {
      id: 'alert-init-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      severity: 'warning',
      zoneId: 'zone1',
      message: 'Độ ẩm đất Khu 1 chạm ngưỡng thấp 38% trước chu kỳ tưới.',
      source: 'ESP8266_NODE_1',
      acknowledged: false,
      resolved: false,
    },
    {
      id: 'alert-init-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      severity: 'info',
      zoneId: 'gateway',
      message: 'Gateway ESP32 hoàn tất đồng bộ giờ hệ thống NTP thành công.',
      source: 'ESP32_GATEWAY',
      acknowledged: true,
      resolved: true,
    },
  ];

  constructor() {
    this.seedInitialHistory();
  }

  private seedInitialHistory() {
    const now = Date.now();
    this.gateway.history = [];
    for (let i = 20; i >= 0; i--) {
      const time = new Date(now - i * 5 * 60 * 1000).toISOString();
      const noise = Math.sin(i / 3) * 1.5;
      this.zones[0].history.push({
        temperature: Number((24.5 + noise).toFixed(1)),
        humidity: Number((67 + noise * 2).toFixed(1)),
        soilMoisture: Number((71 - (i % 8) * 1.2).toFixed(1)),
        timestamp: time,
      });
      this.zones[1].history.push({
        temperature: Number((18.2 + noise * 0.8).toFixed(1)),
        humidity: Number((64 + noise * 1.5).toFixed(1)),
        soilMoisture: Number((65 - (i % 6) * 1.0).toFixed(1)),
        timestamp: time,
      });
      const luxPoint = Math.round(520 + Math.sin(i / 4) * 95 + (20 - i) * 3);
      this.gateway.history.push(luxPoint);
    }
  }

  public getIntervalSeconds(): number {
    return Math.round(this.intervalMs / 1000);
  }

  public setIntervalSeconds(seconds: number): number {
    const clamped = Math.max(1, Math.min(60, Math.round(seconds)));
    this.intervalMs = clamped * 1000;
    if (this.timer) {
      this.stop();
      this.start();
    }
    this.notify();
    return clamped;
  }

  public setOffline(offline: boolean) {
    this.isOffline = offline;
    const status = offline ? 'offline' : 'online';
    this.gateway.status = status;
    this.zones.forEach((z) => {
      z.status = status;
    });
    this.notify();
  }

  public setEmergencyHalted(halted: boolean) {
    this.isEmergencyHalted = halted;
    if (halted) {
      this.actuators.forEach((a) => {
        a.isActive = false;
        a.lastUpdated = new Date().toISOString();
      });
    }
    this.notify();
  }

  public start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.step();
    }, this.intervalMs);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSnapshot(): TelemetryEvent {
    return {
      zones: JSON.parse(JSON.stringify(this.zones)),
      gateway: {
        ...this.gateway,
        history: [...(this.gateway.history || [])],
      },
      actuators: JSON.parse(JSON.stringify(this.actuators)),
      alerts: JSON.parse(JSON.stringify(this.alerts)),
      isEmergencyHalted: this.isEmergencyHalted,
      telemetryIntervalSeconds: this.getIntervalSeconds(),
    };
  }

  public setActuator(id: string, action: 'ON' | 'OFF', powerLevel?: number): ActuatorState {
    const act = this.actuators.find((a) => a.id === id);
    if (!act) throw new Error(`Actuator ${id} not found`);

    if (this.isEmergencyHalted) {
      act.isActive = false;
      this.notify();
      return { ...act };
    }

    act.isActive = action === 'ON';
    if (typeof powerLevel === 'number') {
      act.powerLevel = Math.max(0, Math.min(100, powerLevel));
    }
    act.lastUpdated = new Date().toISOString();

    this.notify();
    return { ...act };
  }

  public emergencyStop() {
    this.isEmergencyHalted = true;
    this.actuators.forEach((a) => {
      a.isActive = false;
      a.lastUpdated = new Date().toISOString();
    });
    this.alerts.unshift({
      id: `alert-emg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'warning',
      zoneId: 'system',
      message: 'LỆNH DỪNG KHẨN CẤP: Toàn bộ thiết bị phần cứng đã được ngắt điện an toàn.',
      source: 'User Operation',
      acknowledged: false,
      resolved: true,
    });
    this.notify();
  }

  public rearmSystem() {
    this.isEmergencyHalted = false;
    this.alerts.unshift({
      id: `alert-rearm-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      zoneId: 'system',
      message: 'Hệ thống đã được khôi phục an toàn sau trạng thái dừng khẩn cấp (Re-arm).',
      source: 'User Operation',
      acknowledged: true,
      resolved: true,
    });
    this.notify();
  }

  public step() {
    if (this.isOffline) {
      return;
    }

    const nowIso = new Date().toISOString();

    const pump = this.actuators.find((a) => a.id === 'water_pump');
    const mist = this.actuators.find((a) => a.id === 'mist_spray');
    const fan = this.actuators.find((a) => a.id === 'ventilation_fan');
    const light = this.actuators.find((a) => a.id === 'grow_light');

    const z1 = this.zones[0];
    let z1Temp = z1.current.temperature;
    let z1Hum = z1.current.humidity;
    let z1Soil = z1.current.soilMoisture;

    const z2 = this.zones[1];
    let z2Temp = z2.current.temperature;
    let z2Hum = z2.current.humidity;
    let z2Soil = z2.current.soilMoisture;

    // Pump impact: soil moisture increases
    if (pump?.isActive) {
      z1Soil = Math.min(85, z1Soil + 1.8);
      z2Soil = Math.min(85, z2Soil + 1.8);
    } else {
      z1Soil = Math.max(30, z1Soil - 0.15);
      z2Soil = Math.max(30, z2Soil - 0.15);
    }

    // Mist spray impact: air humidity increases, temp slightly drops
    if (mist?.isActive) {
      z1Hum = Math.min(92, z1Hum + 2.2);
      z2Hum = Math.min(92, z2Hum + 2.2);
      z1Temp = Math.max(20, z1Temp - 0.2);
      z2Temp = Math.max(15, z2Temp - 0.2);
    } else {
      z1Hum += (68 - z1Hum) * 0.05;
      z2Hum += (64 - z2Hum) * 0.05;
    }

    // Ventilation fan impact: use ?? so PWM 0% truly yields 0 cooling
    if (fan?.isActive) {
      const fanPower = fan.powerLevel ?? 80;
      const coolingRate = 0.3 * (fanPower / 100);
      z1Temp = Math.max(19, z1Temp - coolingRate);
      z2Temp = Math.max(14, z2Temp - coolingRate);
      if (fanPower > 0) {
        z1Hum = Math.max(45, z1Hum - 0.3 * (fanPower / 100));
        z2Hum = Math.max(45, z2Hum - 0.3 * (fanPower / 100));
      }
    } else {
      z1Temp += (25.5 - z1Temp) * 0.04;
      z2Temp += (19.0 - z2Temp) * 0.04;
    }

    // Micro natural noise
    z1Temp += (Math.random() - 0.5) * 0.2;
    z1Hum += (Math.random() - 0.5) * 0.4;
    z1Soil += (Math.random() - 0.5) * 0.1;

    z2Temp += (Math.random() - 0.5) * 0.2;
    z2Hum += (Math.random() - 0.5) * 0.4;
    z2Soil += (Math.random() - 0.5) * 0.1;

    z1.current = {
      temperature: Number(z1Temp.toFixed(1)),
      humidity: Number(z1Hum.toFixed(1)),
      soilMoisture: Number(z1Soil.toFixed(1)),
      timestamp: nowIso,
    };
    z1.history.push({ ...z1.current });
    if (z1.history.length > 50) z1.history.shift();

    z2.current = {
      temperature: Number(z2Temp.toFixed(1)),
      humidity: Number(z2Hum.toFixed(1)),
      soilMoisture: Number(z2Soil.toFixed(1)),
      timestamp: nowIso,
    };
    z2.history.push({ ...z2.current });
    if (z2.history.length > 50) z2.history.shift();

    // Gateway LDR Physics: use ?? so PWM 0% yields 0 boost
    let lux = 550 + Math.sin(Date.now() / 60000) * 120;
    if (light?.isActive) {
      const lightPower = light.powerLevel ?? 80;
      const boost = 350 * (lightPower / 100);
      lux += boost;
    }
    lux += (Math.random() - 0.5) * 15;
    this.gateway.lightIntensity = Math.round(Math.max(10, Math.min(2000, lux)));
    this.gateway.timestamp = nowIso;
    if (!this.gateway.history) this.gateway.history = [];
    this.gateway.history.push(this.gateway.lightIntensity);
    if (this.gateway.history.length > 50) this.gateway.history.shift();

    // Evaluate Automation Rules (blocked during E-Stop)
    this.evaluateAutomation();

    // Check Auto Alert conditions
    this.checkAlertConditions();

    // Notify listeners
    this.notify();
  }

  private evaluateAutomation() {
    if (this.isEmergencyHalted) return;

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      let sensorVal: number = 0;
      if (rule.sensorType === 'lightIntensity') {
        sensorVal = this.gateway.lightIntensity;
      } else {
        const targetZone = rule.targetZone === 'zone2' ? this.zones[1] : this.zones[0];
        if (rule.sensorType === 'temperature') sensorVal = targetZone.current.temperature;
        else if (rule.sensorType === 'humidity') sensorVal = targetZone.current.humidity;
        else if (rule.sensorType === 'soilMoisture') sensorVal = targetZone.current.soilMoisture;
      }

      const actuator = this.actuators.find((a) => a.id === rule.actuatorId);
      if (!actuator || actuator.mode !== 'auto') continue;

      let conditionMet = false;
      if (rule.comparison === '<') conditionMet = sensorVal < rule.threshold;
      else if (rule.comparison === '<=') conditionMet = sensorVal <= rule.threshold;
      else if (rule.comparison === '>') conditionMet = sensorVal > rule.threshold;
      else if (rule.comparison === '>=') conditionMet = sensorVal >= rule.threshold;

      const desiredActive = rule.actuatorAction === 'ON';

      if (conditionMet) {
        if (actuator.isActive !== desiredActive) {
          actuator.isActive = desiredActive;
          if (desiredActive && typeof rule.powerLevel === 'number') {
            actuator.powerLevel = rule.powerLevel;
          }
          actuator.lastUpdated = new Date().toISOString();
        }
      } else if (actuator.isActive === desiredActive) {
        // Apply hysteresis check for all 4 comparison operators to avoid relay chattering
        let shouldRevert = false;
        if (rule.comparison === '<' || rule.comparison === '<=') {
          shouldRevert = sensorVal >= rule.threshold + (rule.hysteresis || 0);
        } else if (rule.comparison === '>' || rule.comparison === '>=') {
          shouldRevert = sensorVal <= rule.threshold - (rule.hysteresis || 0);
        }
        if (shouldRevert) {
          actuator.isActive = !desiredActive;
          actuator.lastUpdated = new Date().toISOString();
        }
      }
    }
  }

  private checkAlertConditions() {
    const z1 = this.zones[0].current;
    const z2 = this.zones[1].current;

    if (z1.temperature > 32 || z2.temperature > 30) {
      const existing = this.alerts.find(
        (a) => !a.resolved && a.message.includes('Nhiệt độ vượt ngưỡng')
      );
      if (!existing) {
        this.alerts.unshift({
          id: `alert-temp-${Date.now()}`,
          timestamp: new Date().toISOString(),
          severity: 'critical',
          zoneId: z1.temperature > 32 ? 'zone1' : 'zone2',
          message: `Nhiệt độ vượt ngưỡng an toàn (${Math.max(z1.temperature, z2.temperature)}°C)! Cần bật quạt thông gió.`,
          source: 'DHT11_SENSOR',
          acknowledged: false,
          resolved: false,
        });
      }
    }

    if (z1.soilMoisture < 35 || z2.soilMoisture < 35) {
      const existing = this.alerts.find(
        (a) => !a.resolved && a.message.includes('Độ ẩm đất thấp')
      );
      if (!existing) {
        this.alerts.unshift({
          id: `alert-soil-${Date.now()}`,
          timestamp: new Date().toISOString(),
          severity: 'warning',
          zoneId: z1.soilMoisture < 35 ? 'zone1' : 'zone2',
          message: 'Độ ẩm đất thấp dưới 35%, cần kích hoạt hệ thống tưới nước.',
          source: 'SOIL_SENSOR',
          acknowledged: false,
          resolved: false,
        });
      }
    }

    if (this.alerts.length > 30) {
      this.alerts = this.alerts.slice(0, 30);
    }
  }

  private notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('Error notifying telemetry listener:', err);
      }
    });
  }
}

export const mockSimulator = new MockSimulator();
