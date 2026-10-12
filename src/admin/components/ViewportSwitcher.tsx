import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { ViewportMode } from '../../types/ecard';

interface ViewportSwitcherProps {
  viewport: ViewportMode;
  onChange: (mode: ViewportMode) => void;
}

const VIEWPORT_OPTIONS: Array<{
  id: ViewportMode;
  label: string;
  dimensions: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'mobile', label: 'Mobile', dimensions: '390×844', icon: Smartphone },
  { id: 'tablet', label: 'Tablet', dimensions: '768×1024', icon: Tablet },
  { id: 'desktop', label: 'Desktop', dimensions: '1440×900', icon: Monitor },
];

export const ViewportSwitcher: React.FC<ViewportSwitcherProps> = ({ viewport, onChange }) => {
  return (
    <div
      className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200"
      role="group"
      aria-label="Chuyển đổi khung nhìn thiết bị"
    >
      {VIEWPORT_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = viewport === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              active
                ? 'bg-[#A33149] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
            <span className={`hidden sm:inline text-[10px] ${active ? 'text-rose-100' : 'text-slate-400'}`}>
              ({opt.dimensions})
            </span>
          </button>
        );
      })}
    </div>
  );
};
