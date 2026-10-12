import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { EcardRenderer } from '../../renderer/EcardRenderer';
import { ViewportMode } from '../../types/ecard';
import { useEditor } from '../context/EditorContext';
import { ViewportSwitcher } from '../components/ViewportSwitcher';

const VIEWPORT_CONTAINER_CLASS: Record<ViewportMode, string> = {
  mobile: 'w-[390px] h-[844px] rounded-[32px] border-[8px] border-slate-800 shadow-2xl',
  tablet: 'w-[768px] h-[900px] rounded-[24px] border-[6px] border-slate-700 shadow-2xl',
  desktop: 'w-full max-w-[1280px] min-h-[780px] rounded-2xl border border-slate-300 shadow-xl',
};

export const PreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editingCardId, toPreviewConfig } = useEditor();
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [previewStep, setPreviewStep] = useState<'welcome' | 'pin' | 'main'>('main');

  const previewConfig = toPreviewConfig();

  const handleBackToEditor = () => {
    const targetId = id || editingCardId || 'new';
    if (targetId === 'new') {
      navigate('/admin/cards/new');
    } else {
      navigate(`/admin/cards/${targetId}/edit`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackToEditor}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại chỉnh sửa</span>
          </button>

          <div>
            <div className="text-sm font-bold text-slate-900">{previewConfig.title}</div>
            <div className="text-xs text-slate-500">
              {previewConfig.ecardData.female_name} &amp; {previewConfig.ecardData.male_name} • Dữ liệu biểu mẫu được giữ nguyên
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Step Switcher */}
          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setPreviewStep('welcome')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                previewStep === 'welcome'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              Màn hình Chào
            </button>
            <button
              type="button"
              onClick={() => setPreviewStep('pin')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                previewStep === 'pin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Màn hình PIN
            </button>
            <button
              type="button"
              onClick={() => setPreviewStep('main')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                previewStep === 'main' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Nội dung Thiệp
            </button>
          </div>

          <ViewportSwitcher viewport={viewport} onChange={setViewport} />
        </div>
      </div>

      {/* Interactive Live Renderer Frame */}
      <div className="bg-slate-200/70 rounded-3xl border border-slate-300 p-4 md:p-8 flex flex-col items-center justify-center overflow-x-auto">
        <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Đang sử dụng trực tiếp bộ kết xuất <code>EcardRenderer</code> của người nhận (Khung nhìn:{' '}
            <strong className="uppercase">{viewport}</strong>)
          </span>
        </div>

        <div
          data-testid={`preview-frame-${viewport}`}
          className={`bg-white overflow-y-auto overflow-x-hidden relative transition-all duration-300 ${VIEWPORT_CONTAINER_CLASS[viewport]}`}
        >
          <EcardRenderer
            config={previewConfig}
            initialStep={previewStep}
            isPreviewMode={true}
            onVerifyPin={async () => ({
              authorized: true,
              cardContent: previewConfig,
              isMockMode: true,
            })}
          />
        </div>
      </div>
    </div>
  );
};
