export interface SensorReading {
  temperature: number; // DHT11, °C (15 - 45)
  humidity: number; // DHT11, % RH (20 - 95)
  soilMoisture: number; // Soil sensor, % (0 - 100)
  timestamp: string; // ISO-8601 string
}

export type ZoneId = 'zone1' | 'zone2';

export interface ZoneData {
  zoneId: ZoneId;
  zoneName: string;
  cropType: 'tomato' | 'lettuce' | 'strawberry' | 'melon' | 'custom';
  nodeId: 'ESP8266_NODE_1' | 'ESP8266_NODE_2';
  status: 'online' | 'offline' | 'warning';
  current: SensorReading;
  history: SensorReading[];
}

export interface GatewayData {
  gatewayId: 'ESP32_GATEWAY';
  status: 'online' | 'offline';
  lightIntensity: number; // LDR sensor, Lux (0 - 100000)
  history?: number[];
  timestamp: string;
}
