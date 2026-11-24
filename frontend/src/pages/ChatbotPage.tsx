import React from 'react';
import { ChatWindow } from '../components/chatbot/ChatWindow';
import { Bot, ShieldCheck, Settings2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useGreenhouse } from '../context/GreenhouseContext';

export interface ChatbotPageProps {
  onOpenAiConfig?: () => void;
}

export const ChatbotPage: React.FC<ChatbotPageProps> = ({ onOpenAiConfig }) => {
  const { runtimeConfig } = useGreenhouse();

  const providerLabel =
    runtimeConfig.aiMode === 'backend-proxy'
      ? 'Chế độ: Backend AI Proxy'
      : runtimeConfig.aiMode === 'gemini-direct'
      ? `Chế độ: Gemini Direct (${runtimeConfig.geminiModel})`
      : 'Chế độ: Mock AI (Offline)';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[18px] border border-[#E6E1D6] p-5 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1F2933] flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#52606D]" aria-hidden="true" />
            <span>Trợ Lý Trí Tuệ Nhân Tạo Google Gemini (Smart Agro-Assistant)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#52606D] mt-1 max-w-2xl">
            Tư vấn sinh trưởng cho Cà chua, Xà lách, Dâu tây và Dưa lưới. Phân tích dữ liệu thời gian thực và đề xuất giải pháp điều khiển vi khí hậu tối ưu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-[#F6F4EF] text-[#3E4C59] border border-[#D8D2C5] px-3 py-1.5 rounded-[10px] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#52606D]" aria-hidden="true" />
            <span>Bảo mật 2 bước: Bắt buộc người dùng xác nhận</span>
          </div>

          {onOpenAiConfig && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Settings2 className="w-3.5 h-3.5 text-[#52606D]" />}
              onClick={onOpenAiConfig}
              title={providerLabel}
            >
              Cấu hình AI
            </Button>
          )}
        </div>
      </div>

      <ChatWindow />
    </div>
  );
};
