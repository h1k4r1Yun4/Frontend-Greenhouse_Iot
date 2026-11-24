import { ActuatorType, ProposedActuatorAction } from '../../types';
import { CROPS } from '../../constants/crops';
import { AiChatRequest, AiChatResponse, IAiAssistantService } from './aiService.interface';

export class MockAiAdapter implements IAiAssistantService {
  public readonly providerName = 'Mock AI (Offline)';

  async generateResponse(req: AiChatRequest): Promise<AiChatResponse> {
    await new Promise((res) => setTimeout(res, 350));

    const { message, cropKey, zoneKey, zones, gateway, actuators } = req;
    const crop = CROPS[cropKey] || CROPS.tomato;
    const z1 = zones.find((z) => z.zoneId === 'zone1') || zones[0];
    const z2 = zones.find((z) => z.zoneId === 'zone2') || zones[1];
    const activeZone = zoneKey === 'zone2' ? z2 || z1 : z1;

    const currentTemp = activeZone?.current.temperature ?? 25;
    const currentHumidity = activeZone?.current.humidity ?? 68;
    const currentSoil = activeZone?.current.soilMoisture ?? 70;
    const currentLight = gateway.lightIntensity ?? 600;

    const lower = message.toLowerCase().trim();

    // 1. Check OFF / STOP commands FIRST so "tắt quạt" / "dừng bơm" never routes to ON
    if (lower.includes('tắt') || lower.includes('dừng') || lower.includes('ngắt')) {
      let targetActuator: ActuatorType = 'water_pump';
      let actName = 'Máy bơm nước tưới gốc';

      if (lower.includes('quạt') || lower.includes('thông gió')) {
        targetActuator = 'ventilation_fan';
        actName = 'Quạt thông gió làm mát';
      } else if (lower.includes('sương') || lower.includes('phun')) {
        targetActuator = 'mist_spray';
        actName = 'Hệ thống phun sương tạo ẩm';
      } else if (lower.includes('đèn') || lower.includes('led')) {
        targetActuator = 'grow_light';
        actName = 'Đèn LED chiếu sáng quang hợp';
      }

      const proposedAction: ProposedActuatorAction = {
        id: `prop_off_${Date.now()}`,
        actuatorId: targetActuator,
        actuatorName: actName,
        targetZone: zoneKey === 'zone1' || zoneKey === 'zone2' ? zoneKey : 'all',
        action: 'OFF',
        reason: `Người dùng yêu cầu ngắt hoạt động của ${actName}.`,
        status: 'PENDING_CONFIRMATION',
      };

      return {
        provider: this.providerName,
        text: `**Yêu cầu ngắt thiết bị ${actName}:**\nĐể đảm bảo an toàn cho hệ thống cơ điện nhà kính, vui lòng kiểm tra thông số và bấm **Xác nhận Điều khiển** bên dưới để phê duyệt lệnh tắt.`,
        proposedAction,
      };
    }

    // 2. Water pump / tưới nước / độ ẩm đất
    if (
      lower.includes('tưới') ||
      lower.includes('bơm') ||
      lower.includes('ẩm đất') ||
      lower.includes('khô') ||
      lower.includes('nước')
    ) {
      const isDry = currentSoil < crop.optimalSoilMoisture.min;
      const pump = actuators.find((a) => a.id === 'water_pump');

      if (pump?.isActive) {
        return {
          provider: this.providerName,
          text: `Hệ thống **Máy bơm nước** hiện đang hoạt động tại ${activeZone.zoneName}. Độ ẩm đất hiện đo được là **${currentSoil}%** (ngưỡng tối ưu của ${crop.nameVi}: ${crop.optimalSoilMoisture.min}% - ${crop.optimalSoilMoisture.max}%). Hệ thống sẽ tự động ngắt khi đạt độ ẩm chuẩn.`,
        };
      }

      if (isDry || lower.includes('bật') || lower.includes('tưới')) {
        const proposedAction: ProposedActuatorAction = {
          id: `prop_pump_${Date.now()}`,
          actuatorId: 'water_pump',
          actuatorName: 'Máy bơm nước tưới gốc',
          targetZone: zoneKey === 'all' ? 'all' : activeZone.zoneId,
          action: 'ON',
          reason: `Độ ẩm đất hiện tại (${currentSoil}%) đang cần bổ sung để đạt dải tối ưu (${crop.optimalSoilMoisture.min}% - ${crop.optimalSoilMoisture.max}%) của cây ${crop.nameVi}.`,
          status: 'PENDING_CONFIRMATION',
        };

        return {
          provider: this.providerName,
          text: `**Phân tích Nông học cho ${crop.nameVi}:**\nĐộ ẩm đất hiện tại tại ${activeZone.zoneName} là **${currentSoil}%** (ngưỡng tối ưu: ${crop.optimalSoilMoisture.min}% - ${crop.optimalSoilMoisture.max}%).\n\nTôi đề xuất kích hoạt **Máy bơm nước tưới gốc** để bổ sung ẩm cho vùng rễ. Vui lòng bấm **Xác nhận Điều khiển** bên dưới để mở hộp thoại phê duyệt an toàn trước khi phát lệnh.`,
          proposedAction,
        };
      }

      return {
        provider: this.providerName,
        text: `Độ ẩm đất hiện tại tại ${activeZone.zoneName} đạt **${currentSoil}%**, nằm trong dải sinh trưởng lý tưởng (${crop.optimalSoilMoisture.min}% - ${crop.optimalSoilMoisture.max}%) của cây ${crop.nameVi}. Chưa cần tưới thêm lúc này để tránh úng rễ.`,
      };
    }

    // 3. Ventilation fan / quạt / nhiệt độ / làm mát
    if (
      lower.includes('quạt') ||
      lower.includes('nhiệt độ') ||
      lower.includes('nóng') ||
      lower.includes('làm mát') ||
      lower.includes('thông gió')
    ) {
      const isHot = currentTemp > crop.optimalTemp.max;
      const fan = actuators.find((a) => a.id === 'ventilation_fan');

      if (isHot || lower.includes('bật')) {
        const proposedAction: ProposedActuatorAction = {
          id: `prop_fan_${Date.now()}`,
          actuatorId: 'ventilation_fan',
          actuatorName: 'Quạt thông gió làm mát',
          targetZone: 'all',
          action: 'ON',
          powerLevel: 85,
          reason: `Nhiệt độ hiện tại (${currentTemp}°C) vượt hoặc tiệm cận ngưỡng trên (${crop.optimalTemp.max}°C) của ${crop.nameVi}.`,
          status: 'PENDING_CONFIRMATION',
        };

        return {
          provider: this.providerName,
          text: `**Đánh giá Nhiệt độ Vi khí hậu:**\nNhiệt độ đo được tại ${activeZone.zoneName} là **${currentTemp}°C** (mức lý tưởng cho ${crop.nameVi}: ${crop.optimalTemp.min}°C - ${crop.optimalTemp.max}°C).\n\nKhuyến nghị bật **Quạt thông gió (công suất 85%)** để hạ nhiệt và tăng cường lưu thông không khí, hạn chế héo lá.`,
          proposedAction,
        };
      }

      return {
        provider: this.providerName,
        text: `Nhiệt độ hiện tại tại ${activeZone.zoneName} là **${currentTemp}°C**, ổn định trong ngưỡng tối ưu (${crop.optimalTemp.min}°C - ${crop.optimalTemp.max}°C) của cây ${crop.nameVi}. Quạt thông gió hiện ${fan?.isActive ? 'đang chạy duy trì' : 'đang ở trạng thái nghỉ'}.`,
      };
    }

    // 4. Mist spray / phun sương / độ ẩm không khí
    if (
      lower.includes('sương') ||
      lower.includes('phun') ||
      lower.includes('độ ẩm không khí') ||
      lower.includes('khô hanh')
    ) {
      const isDryAir = currentHumidity < crop.optimalHumidity.min;
      const proposedAction: ProposedActuatorAction = {
        id: `prop_mist_${Date.now()}`,
        actuatorId: 'mist_spray',
        actuatorName: 'Hệ thống phun sương tạo ẩm',
        targetZone: 'all',
        action: 'ON',
        reason: `Độ ẩm không khí (${currentHumidity}% RH) thấp hơn dải thích hợp (${crop.optimalHumidity.min}% - ${crop.optimalHumidity.max}%).`,
        status: 'PENDING_CONFIRMATION',
      };

      if (isDryAir || lower.includes('bật')) {
        return {
          provider: this.providerName,
          text: `**Đánh giá Độ ẩm Không khí:**\nĐộ ẩm không khí hiện tại là **${currentHumidity}% RH** (khuyến nghị cho ${crop.nameVi}: ${crop.optimalHumidity.min}% - ${crop.optimalHumidity.max}%).\n\nTôi đề xuất kích hoạt **Hệ thống phun sương tạo ẩm** để cân bằng vi khí hậu và bảo vệ tán lá.`,
          proposedAction,
        };
      }

      return {
        provider: this.providerName,
        text: `Độ ẩm không khí hiện tại đạt **${currentHumidity}% RH**, đáp ứng tốt nhu cầu sinh lý của cây ${crop.nameVi}.`,
      };
    }

    // 5. Grow light / đèn / ánh sáng / Lux
    if (
      lower.includes('đèn') ||
      lower.includes('ánh sáng') ||
      lower.includes('quang hợp') ||
      lower.includes('lux')
    ) {
      const isDark = currentLight < crop.optimalLightLux.min;
      const proposedAction: ProposedActuatorAction = {
        id: `prop_light_${Date.now()}`,
        actuatorId: 'grow_light',
        actuatorName: 'Đèn LED chiếu sáng quang hợp',
        targetZone: 'all',
        action: 'ON',
        powerLevel: 80,
        reason: `Cường độ ánh sáng LDR (${currentLight} Lux) chưa đạt ngưỡng tối ưu (${crop.optimalLightLux.min} Lux) cho quang hợp.`,
        status: 'PENDING_CONFIRMATION',
      };

      if (isDark || lower.includes('bật')) {
        return {
          provider: this.providerName,
          text: `**Cường độ Ánh sáng Quang trở LDR:**\nCảm biến Gateway ESP32 ghi nhận ánh sáng hiện tại là **${currentLight} Lux** (ngưỡng mong muốn: ${crop.optimalLightLux.min} - ${crop.optimalLightLux.max} Lux).\n\nĐề xuất bật **Đèn LED quang phổ bổ sung (công suất 80%)** để hỗ trợ quá trình quang hợp của cây.`,
          proposedAction,
        };
      }

      return {
        provider: this.providerName,
        text: `Cường độ ánh sáng đo được từ Gateway ESP32 là **${currentLight} Lux**, đủ cho quá trình quang hợp tích cực của cây ${crop.nameVi}.`,
      };
    }

    // 6. Default comprehensive overview (handles 'all' by summarizing both zones accurately)
    if (zoneKey === 'all' && z1 && z2) {
      return {
        provider: this.providerName,
        text: `**Báo cáo Tổng quan Toàn Nhà kính (Tham chiếu ${crop.nameVi}):**\n- **Khu vực 1 (Cà chua):** ${z1.current.temperature}°C | Ẩm KK ${z1.current.humidity}% | Ẩm đất ${z1.current.soilMoisture}%\n- **Khu vực 2 (Xà lách):** ${z2.current.temperature}°C | Ẩm KK ${z2.current.humidity}% | Ẩm đất ${z2.current.soilMoisture}%\n- **Ánh sáng Gateway LDR:** ${currentLight} Lux (Chuẩn ${crop.nameVi}: ${crop.optimalLightLux.min}-${crop.optimalLightLux.max} Lux)\n\n*Khuyến nghị canh tác:* ${crop.description} ${crop.wateringAdvice}\n\nBạn có thể yêu cầu tôi kiểm tra từng thông số hoặc đề xuất bật/tắt thiết bị.`,
      };
    }

    return {
      provider: this.providerName,
      text: `**Báo cáo Môi trường (${activeZone?.zoneName || 'Nhà kính'} · ${crop.nameVi}):**\n- **Nhiệt độ DHT11:** ${currentTemp}°C (Chuẩn: ${crop.optimalTemp.min}-${crop.optimalTemp.max}°C)\n- **Độ ẩm không khí:** ${currentHumidity}% (Chuẩn: ${crop.optimalHumidity.min}-${crop.optimalHumidity.max}%)\n- **Độ ẩm đất:** ${currentSoil}% (Chuẩn: ${crop.optimalSoilMoisture.min}-${crop.optimalSoilMoisture.max}%)\n- **Ánh sáng LDR:** ${currentLight} Lux (Chuẩn: ${crop.optimalLightLux.min}-${crop.optimalLightLux.max} Lux)\n\n*Lời khuyên sinh trưởng:* ${crop.description} ${crop.wateringAdvice}`,
    };
  }
}
