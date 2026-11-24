import { AutomationRule } from '../types';

export const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule_pump_soil_moisture',
    name: 'Tưới nước tự động khi đất khô',
    enabled: true,
    targetZone: 'zone1',
    sensorType: 'soilMoisture',
    comparison: '<',
    threshold: 40,
    hysteresis: 15, // Ngắt khi đất đạt 40 + 15 = 55%
    actuatorId: 'water_pump',
    actuatorAction: 'ON',
  },
  {
    id: 'rule_mist_air_humidity',
    name: 'Phun sương tạo ẩm không khí',
    enabled: true,
    targetZone: 'all',
    sensorType: 'humidity',
    comparison: '<',
    threshold: 60,
    hysteresis: 10, // Ngắt khi độ ẩm đạt 60 + 10 = 70%
    actuatorId: 'mist_spray',
    actuatorAction: 'ON',
  },
  {
    id: 'rule_fan_temperature',
    name: 'Làm mát nhà kính bằng quạt thông gió',
    enabled: true,
    targetZone: 'all',
    sensorType: 'temperature',
    comparison: '>',
    threshold: 30,
    hysteresis: 3, // Ngắt khi nhiệt độ giảm xuống 30 - 3 = 27°C
    actuatorId: 'ventilation_fan',
    actuatorAction: 'ON',
    powerLevel: 80,
  },
  {
    id: 'rule_light_intensity',
    name: 'Bổ sung ánh sáng quang hợp LED',
    enabled: true,
    targetZone: 'all',
    sensorType: 'lightIntensity',
    comparison: '<',
    threshold: 350,
    hysteresis: 150, // Ngắt khi ánh sáng đạt 350 + 150 = 500 Lux
    actuatorId: 'grow_light',
    actuatorAction: 'ON',
    powerLevel: 75,
  },
];
