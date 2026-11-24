import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage, ProposedActuatorAction } from '../../types';
import { useGreenhouse } from '../../context/GreenhouseContext';
import { geminiService } from '../../services/geminiService';
import { ChatMessageItem } from './ChatMessageItem';
import { SafeConfirmModal } from './SafeConfirmModal';
import { CropZoneSelector } from './CropZoneSelector';

export const ChatWindow: React.FC = () => {
  const { zones, gateway, actuators, toggleActuator, userRole, isEmergencyHalted } = useGreenhouse();

  const canExecute = (userRole === 'admin' || userRole === 'operator') && !isEmergencyHalted;
  const blockedReason =
    userRole === 'viewer'
      ? 'Vai trò Người xem (Viewer) chỉ có quyền đọc — không thể xác nhận phát lệnh phần cứng.'
      : isEmergencyHalted
      ? 'Hệ thống đang khóa DỪNG KHẨN CẤP (EMERGENCY HALTED) — hãy Re-arm trước khi thực thi lệnh.'
      : undefined;

  const [crop, setCrop] = useState<string>('tomato');
  const [zone, setZone] = useState<string>('zone1');
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [modalProposal, setModalProposal] = useState<ProposedActuatorAction | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      text: 'Xin chào! Tôi là **Trợ lý AI Google Gemini** phụ trách Nhà kính thông minh IoT. Tôi có thể phân tích số liệu vi khí hậu thời gian thực từ 2 khu vực trồng trọt, tư vấn ngưỡng sinh trưởng nông học và đề xuất lệnh điều khiển thiết bị an toàn.\n\nBạn cần tôi hỗ trợ kiểm tra điều kiện gì hôm nay?',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text,
      cropContext: crop,
      zoneContext: zone as ChatMessage['zoneContext'],
    };

    const nextHistory = [...messages, userMsg].slice(-8).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await geminiService.generateResponse(
        text,
        crop,
        zone,
        zones,
        gateway,
        actuators,
        nextHistory
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: response.text,
        proposedAction: response.proposedAction,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRequestConfirm = (proposal: ProposedActuatorAction) => {
    if (!canExecute) return;
    setModalProposal(proposal);
  };

  const handleExecuteConfirmedAction = async () => {
    if (!modalProposal || !canExecute) return;

    await toggleActuator(
      modalProposal.actuatorId,
      modalProposal.action === 'OFF' ? 'OFF' : 'ON',
      modalProposal.powerLevel
    );

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.proposedAction?.id === modalProposal.id) {
          return {
            ...msg,
            proposedAction: {
              ...msg.proposedAction,
              status: 'CONFIRMED',
            },
          };
        }
        return msg;
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: `**Lệnh đã thực thi an toàn:** Đã chuyển trạng thái ${modalProposal.actuatorName} sang **${modalProposal.action}** theo phê duyệt của người dùng. Trạng thái phần cứng đã được cập nhật thành công.`,
      },
    ]);

    setModalProposal(null);
  };

  const handleRejectAction = (proposalId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.proposedAction?.id === proposalId) {
          return {
            ...msg,
            proposedAction: {
              ...msg.proposedAction,
              status: 'REJECTED',
            },
          };
        }
        return msg;
      })
    );
  };

  const quickChips = [
    'Độ ẩm đất hiện tại có thích hợp cho cà chua không?',
    'Nhiệt độ đang cao, tôi có nên bật quạt thông gió?',
    'Đề xuất chế độ tưới tối ưu hôm nay',
    'Kiểm tra cường độ ánh sáng LDR Gateway',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-235px)] min-h-[460px] max-h-[720px] bg-white rounded-[18px] border border-[#E6E1D6] overflow-hidden shadow-card">
      {/* Top Agro-Context Selector */}
      <div className="p-3.5 sm:p-4 bg-white border-b border-[#EFECE4] flex-shrink-0">
        <CropZoneSelector
          selectedCrop={crop}
          onSelectCrop={setCrop}
          selectedZone={zone}
          onSelectZone={setZone}
        />
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#FAF9F6] space-y-2">
        {messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            onRequestConfirm={handleRequestConfirm}
            onReject={handleRejectAction}
            canExecute={canExecute}
            blockedReason={blockedReason}
          />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#52606D] bg-white border border-[#E6E1D6] rounded-full px-4 py-2 w-fit shadow-card">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#15803D]" aria-hidden="true" />
            <span>Trợ lý AI đang phân tích số liệu vi khí hậu...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2.5 bg-[#EFECE4] border-t border-[#E2DDD2] flex items-center sm:flex-wrap gap-2 overflow-x-auto text-xs no-scrollbar flex-shrink-0">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#15803D]" aria-hidden="true" />
          <span className="font-bold text-[#1F2933]">Gợi ý nhanh:</span>
        </div>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            className="flex-shrink-0 px-3 py-1 bg-white hover:bg-[#EAF6EE] text-[#1F2933] hover:text-[#14532D] rounded-full border border-[#D8D2C5] hover:border-[#B7E1C6] transition-colors font-semibold cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3.5 sm:p-4 bg-white border-t border-[#EFECE4] flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            type="text"
            placeholder="Hỏi trợ lý AI về tưới nước, nhiệt độ, độ ẩm hoặc lệnh bật/tắt thiết bị..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 text-sm bg-[#FAF9F6] border border-[#D8D2C5] text-[#1F2933] placeholder:text-[#616E7C] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#15803D] focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={isTyping || !inputText.trim()}
            className="p-3 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all disabled:bg-[#E6E1D6] disabled:text-[#616E7C] disabled:cursor-not-allowed active:scale-95 flex-shrink-0 cursor-pointer"
            aria-label="Gửi tin nhắn"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <SafeConfirmModal
        isOpen={modalProposal !== null}
        proposal={modalProposal}
        onConfirm={handleExecuteConfirmedAction}
        onCancel={() => setModalProposal(null)}
        canExecute={canExecute}
      />
    </div>
  );
};
