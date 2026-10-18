import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldAlert, Unlock } from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { getCardAccessService } from '../../services';

export const AccessSettingsSection: React.FC = () => {
  const { draft, updateDraft, pinForm, setPinForm } = useEditor();
  const isMockMode = getCardAccessService().isMockMode;
  const [showPinText, setShowPinText] = useState(false);

  const sanitizeDigits = (val: string) => val.replace(/\D/g, '').slice(0, 4);

  const isPinLengthValid = pinForm.pin.length === 0 || pinForm.pin.length === 4;
  const isPinMatch =
    pinForm.confirmPin.length === 0 || pinForm.pin === pinForm.confirmPin;
  const isCompleteValid =
    pinForm.pin.length === 4 &&
    pinForm.confirmPin.length === 4 &&
    pinForm.pin === pinForm.confirmPin;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {draft.hasPin ? (
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#A33149] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Unlock className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Cài đặt Quyền truy cập &amp; Mã PIN 4 số
              </h2>
              <p className="text-xs text-slate-500">
                Bảo vệ nội dung riêng tư của khách hàng bằng màn hình khóa PIN 4 chữ số.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={draft.hasPin}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  hasPin: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded text-[#A33149]"
            />
            <span>Yêu cầu nhập mã PIN 4 số</span>
          </label>
        </div>

        {/* Security & Integration Boundary Banner */}
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${isMockMode ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${isMockMode ? 'text-amber-600' : 'text-emerald-600'}`} />
          <div className={`text-xs space-y-1 ${isMockMode ? 'text-amber-900' : 'text-emerald-900'}`}>
            <div className="font-bold">
              {isMockMode ? 'PIN chỉ dùng để xem thử' : 'PIN được xác thực an toàn trên máy chủ'}
            </div>
            <p className={`leading-relaxed ${isMockMode ? 'text-amber-800' : 'text-emerald-800'}`}>
              {isMockMode
                ? <>Mã PIN chỉ được kiểm tra trong dữ liệu mẫu của trình duyệt; đây không phải chế độ bảo vệ để phát hành thiệp thật.</>
                : <>Mã PIN được băm và xác thực trên Supabase. Thiệp chỉ trả nội dung riêng tư sau khi máy chủ cấp quyền truy cập.</>}
            </p>
          </div>
        </div>

        {draft.hasPin && (
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="pin-input"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Mã PIN 4 chữ số mới
                </label>
                <div className="relative">
                  <input
                    id="pin-input"
                    type={showPinText ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={pinForm.pin}
                    onChange={(e) => {
                      const next = sanitizeDigits(e.target.value);
                      setPinForm((prev) => ({
                        ...prev,
                        pin: next,
                        touched: true,
                      }));
                    }}
                    placeholder="••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base tracking-[0.4em] font-mono focus:outline-none focus:border-[#A33149]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinText((v) => !v)}
                    aria-label={showPinText ? 'Ẩn mã PIN' : 'Hiện mã PIN'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Masked 4-dot visual indicator */}
                <div className="flex items-center gap-2 mt-2.5">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`w-3 h-3 rounded-full border ${
                        pinForm.pin.length > i
                          ? 'bg-[#A33149] border-[#A33149]'
                          : 'border-slate-300 bg-slate-100'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-slate-500 ml-1">
                    {pinForm.pin.length}/4 chữ số
                  </span>
                </div>

                {pinForm.touched && !isPinLengthValid && (
                  <p className="text-xs text-rose-600 mt-1">
                    Mã PIN phải gồm đúng 4 chữ số (0–9).
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pin-confirm-input"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Xác nhận lại Mã PIN
                </label>
                <input
                  id="pin-confirm-input"
                  type={showPinText ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={pinForm.confirmPin}
                  onChange={(e) => {
                    const next = sanitizeDigits(e.target.value);
                    setPinForm((prev) => ({
                      ...prev,
                      confirmPin: next,
                      touched: true,
                    }));
                  }}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base tracking-[0.4em] font-mono focus:outline-none focus:border-[#A33149]"
                />

                {pinForm.touched && !isPinMatch && (
                  <p className="text-xs text-rose-600 mt-2">
                    Mã PIN xác nhận chưa trùng khớp.
                  </p>
                )}
                {isCompleteValid && (
                  <p className="text-xs text-emerald-700 font-semibold mt-2">
                    ✓ Mã PIN 4 số hợp lệ và đã khớp.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề màn hình khóa PIN
                </label>
                <input
                  type="text"
                  value={draft.pinScreenConfig.heading || 'Mở khóa kỷ niệm'}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      pinScreenConfig: {
                        ...prev.pinScreenConfig,
                        heading: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lời nhắn gợi ý trên màn hình PIN
                </label>
                <input
                  type="text"
                  value={draft.pinScreenConfig.subheading || 'Bất ngờ cho cậu nà 😜'}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      pinScreenConfig: {
                        ...prev.pinScreenConfig,
                        subheading: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
