export interface CropThreshold {
  id: 'tomato' | 'lettuce' | 'strawberry' | 'melon';
  nameVi: string;
  nameEn: string;
  optimalTemp: { min: number; max: number }; // °C
  optimalHumidity: { min: number; max: number }; // %
  optimalSoilMoisture: { min: number; max: number }; // %
  optimalLightLux: { min: number; max: number }; // Lux
  description: string;
  wateringAdvice: string;
  lightingAdvice: string;
}

export const CROPS: Record<string, CropThreshold> = {
  tomato: {
    id: 'tomato',
    nameVi: 'Cà chua',
    nameEn: 'Tomato',
    optimalTemp: { min: 20, max: 28 },
    optimalHumidity: { min: 60, max: 75 },
    optimalSoilMoisture: { min: 65, max: 80 },
    optimalLightLux: { min: 600, max: 1200 },
    description: 'Ưa khí hậu ấm áp, ánh sáng mạnh và độ ẩm đất cao ổn định.',
    wateringAdvice: 'Duy trì độ ẩm đất 70-80%, tránh tưới đẫm làm ngập úng gốc.',
    lightingAdvice: 'Cần ít nhất 8-10 giờ ánh sáng mỗi ngày với cường độ trên 600 Lux.',
  },
  lettuce: {
    id: 'lettuce',
    nameVi: 'Rau xà lách',
    nameEn: 'Lettuce',
    optimalTemp: { min: 15, max: 22 },
    optimalHumidity: { min: 60, max: 70 },
    optimalSoilMoisture: { min: 55, max: 70 },
    optimalLightLux: { min: 400, max: 800 },
    description: 'Cây ưa mát, dễ bị đắng hoặc trổ ngồng nếu nhiệt độ trên 25°C.',
    wateringAdvice: 'Tưới đều đặn giữ ẩm nhẹ 60-70%, không để úng gốc.',
    lightingAdvice: 'Ánh sáng khuếch tán vừa phải 400-800 Lux, tránh nắng gắt trưa.',
  },
  strawberry: {
    id: 'strawberry',
    nameVi: 'Dâu tây',
    nameEn: 'Strawberry',
    optimalTemp: { min: 18, max: 25 },
    optimalHumidity: { min: 65, max: 75 },
    optimalSoilMoisture: { min: 60, max: 75 },
    optimalLightLux: { min: 500, max: 1000 },
    description: 'Thích hợp khí hậu ôn đới, nhạy cảm với nấm mốc khi độ ẩm quá cao.',
    wateringAdvice: 'Tưới nhỏ giọt tại gốc giữ ẩm 60-75%, hạn chế ướt lá và quả.',
    lightingAdvice: 'Chiếu sáng 8-12 tiếng/ngày, bổ sung đèn LED khi trời râm.',
  },
  melon: {
    id: 'melon',
    nameVi: 'Dưa lưới',
    nameEn: 'Melon',
    optimalTemp: { min: 25, max: 32 },
    optimalHumidity: { min: 50, max: 65 },
    optimalSoilMoisture: { min: 50, max: 65 },
    optimalLightLux: { min: 800, max: 1500 },
    description: 'Cây ưa nhiệt và khô thoáng, cần nhiều ánh sáng quang hợp tạo ngọt.',
    wateringAdvice: 'Tưới vừa phải giữ độ ẩm đất 50-65%, giảm nước giai đoạn chín.',
    lightingAdvice: 'Ánh sáng rất cao trên 800 Lux, thông gió tốt để chống nấm.',
  },
};
