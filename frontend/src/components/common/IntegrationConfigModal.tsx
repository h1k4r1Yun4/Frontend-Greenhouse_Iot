import React, { useState, useEffect } from 'react';
import { Server, Bot, CheckCircle2, AlertCircle, RotateCcw, Wifi, Shield } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useGreenhouse } from '../../context/GreenhouseContext';
import { ApiMode, AiMode, resetRuntimeConfig, RuntimeConfig } from '../../config/runtimeConfig';
import { HealthCheckResult } from '../../services/api';

export interface IntegrationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'backend' | 'ai';
}

export const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'backend',
}) => {
  const { runtimeConfig, updateRuntimeConfig, testBackendConnection } = useGreenhouse();
  const [activeTab, setActiveTab] = useState<'backend' | 'ai'>(initialTab);
  const [draft, setDraft] = useState<RuntimeConfig>(runtimeConfig);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraft(runtimeConfig);
      setActiveTab(initialTab);
      setHealthResult(null);
    }
  }, [isOpen, initialTab, runtimeConfig]);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const result = await testBackendConnection(draft);
      setHealthResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateRuntimeConfig(draft);
    onClose();
  };

  const handleReset = () => {
    const defaults = resetRuntimeConfig();
    setDraft(defaults);
    updateRuntimeConfig(defaults);
    setHealthResult(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu Hình Kết Nối Backend & Trợ Lý AI"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-[#EFECE4] p-1 rounded-[12px] border border-[#E2DDD2]">
          <button
            type="button"
            onClick={() => setActiveTab('backend')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[9px] text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'backend'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#52606D] hover:text-[#1F2933]'
            }`}
          >
            <Server className="w-4 h-4" aria-hidden="true" />
            <span>Kết nối Backend (REST &amp; WebSocket)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[9px] text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#52606D] hover:text-[#1F2933]'
            }`}
          >
            <Bot className="w-4 h-4" aria-hidden="true" />
            <span>Trợ lý AI (Proxy / Gemini API)</span>
          </button>
        </div>

        {activeTab === 'backend' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              {([
                {
                  id: 'mock' as ApiMode,
                  title: 'Chế độ Giả lập (Mock)',
                  desc: 'Chạy độc lập hoàn toàn, mô phỏng 5s',
                },
                {
                  id: 'http' as ApiMode,
                  title: 'Backend Thực tế (HTTP + WS)',
                  desc: 'Kết nối Node.js / MQTT / WebSocket',
                },
              ]).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, apiMode: mode.id }))}
                  className={`text-left p-3.5 rounded-[14px] border transition-all cursor-pointer ${
                    draft.apiMode === mode.id
                      ? 'bg-[#EAF6EE] border-[#15803D] text-[#14532D]'
                      : 'bg-[#FAF9F6] border-[#E6E1D6] text-[#1F2933] hover:border-[#D8D2C5]'
                  }`}
                >
                  <div className="text-xs font-bold">{mode.title}</div>
                  <div className="text-[11px] text-[#52606D] mt-0.5">{mode.desc}</div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  REST API Base URL
                </label>
                <input
                  type="url"
                  value={draft.apiBaseUrl}
                  onChange={(e) => setDraft((prev) => ({ ...prev, apiBaseUrl: e.target.value }))}
                  placeholder="http://localhost:4000/api"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-[#FAF9F6] border border-[#D8D2C5] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  WebSocket Telemetry URL
                </label>
                <input
                  type="text"
                  value={draft.wsUrl}
                  onChange={(e) => setDraft((prev) => ({ ...prev, wsUrl: e.target.value }))}
                  placeholder="ws://localhost:4000/ws/greenhouse"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-[#FAF9F6] border border-[#D8D2C5] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  Bearer Token (Tùy chọn — chỉ lưu trong phiên trình duyệt)
                </label>
                <input
                  type="password"
                  value={draft.authToken}
                  onChange={(e) => setDraft((prev) => ({ ...prev, authToken: e.target.value }))}
                  placeholder="Nhập token xác thực nếu Backend yêu cầu"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-[#FAF9F6] border border-[#D8D2C5] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>
            </div>

            {/* Health Check Box */}
            <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E1D6] rounded-[14px] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#52606D]">
                Kiểm tra endpoint <span className="font-mono font-semibold text-[#1F2933]">GET /health</span> trước khi lưu.
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Wifi className="w-3.5 h-3.5" />}
                onClick={handleTest}
                disabled={isTesting}
              >
                {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
              </Button>
            </div>

            {healthResult && (
              <div
                className={`p-3 rounded-[12px] border text-xs flex items-center gap-2 ${
                  healthResult.ok
                    ? 'bg-[#EAF6EE] border-[#B7E1C6] text-[#14532D]'
                    : 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]'
                }`}
              >
                {healthResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                )}
                <span>
                  {healthResult.message} ({healthResult.latencyMs}ms)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {([
                {
                  id: 'mock' as AiMode,
                  title: 'Mock Nông học',
                  desc: 'Phản hồi ngoại tuyến tức thì',
                },
                {
                  id: 'backend-proxy' as AiMode,
                  title: 'Backend AI Proxy',
                  desc: 'An toàn nhất: API key đặt ở server',
                },
                {
                  id: 'gemini-direct' as AiMode,
                  title: 'Gemini API Trực tiếp',
                  desc: 'Thử nghiệm nhanh bằng key cá nhân',
                },
              ]).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, aiMode: mode.id }))}
                  className={`text-left p-3.5 rounded-[14px] border transition-all cursor-pointer ${
                    draft.aiMode === mode.id
                      ? 'bg-[#EAF6EE] border-[#15803D] text-[#14532D]'
                      : 'bg-[#FAF9F6] border-[#E6E1D6] text-[#1F2933] hover:border-[#D8D2C5]'
                  }`}
                >
                  <div className="text-xs font-bold">{mode.title}</div>
                  <div className="text-[11px] text-[#52606D] mt-0.5">{mode.desc}</div>
                </button>
              ))}
            </div>

            {draft.aiMode === 'backend-proxy' && (
              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  Đường dẫn AI Proxy Endpoint (POST)
                </label>
                <input
                  type="text"
                  value={draft.aiEndpoint}
                  onChange={(e) => setDraft((prev) => ({ ...prev, aiEndpoint: e.target.value }))}
                  placeholder="/ai/chat"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-[#FAF9F6] border border-[#D8D2C5] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
                <p className="text-[11px] text-[#52606D] mt-1">
                  Kết hợp với API Base URL nếu dùng đường dẫn tương đối, hoặc nhập full URL.
                </p>
              </div>
            )}

            {draft.aiMode === 'gemini-direct' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                    Google Gemini Model
                  </label>
                  <input
                    type="text"
                    value={draft.geminiModel}
                    onChange={(e) => setDraft((prev) => ({ ...prev, geminiModel: e.target.value }))}
                    placeholder="gemini-2.5-flash"
                    className="w-full px-3.5 py-2 text-sm font-mono bg-[#FAF9F6] border border-[#D8D2C5] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                    Gemini API Key (Chỉ lưu tạm trong SessionStorage)
                  </label>
                  <input
                    type="password"
                    value={draft.geminiApiKey}
                    onChange={(e) => setDraft((prev) => ({ ...prev, geminiApiKey: e.target.value }))}
                    placeholder="AIza..."
                    className="w-full px-3.5 py-2 text-sm font-mono bg-[#FAF9F6] border border-[#D8D2C5] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
              </div>
            )}

            <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E1D6] rounded-[14px] text-xs text-[#52606D] flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-[#15803D] mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>
                Mọi đề xuất điều khiển từ AI (dù qua Mock, Backend Proxy hay Gemini API) đều bắt buộc đi qua quy trình phê duyệt 2 bước của con người trước khi gửi xuống ESP32.
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#EFECE4]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleReset}
          >
            Khôi phục mặc định (Mock)
          </Button>

          <div className="flex items-center gap-2.5">
            <Button type="button" variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button type="submit" variant="primary">
              Lưu Cấu Hình
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
