import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ExternalLink,
  Eye,
  Heart,
  Layers,
  LayoutDashboard,
  PlusCircle,
  X,
} from 'lucide-react';
import { DEFAULT_ECARD_UUID } from '../data/ecardData';

interface AdminSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  {
    to: '/admin',
    end: true,
    label: 'Tổng quan',
    icon: LayoutDashboard,
  },
  {
    to: '/admin/cards',
    end: false,
    label: 'Quản lý Thiệp',
    icon: Layers,
  },
  {
    to: '/admin/cards/new',
    end: true,
    label: 'Tạo Thiệp Mới',
    icon: PlusCircle,
  },
  {
    to: '/admin/preview',
    end: false,
    label: 'Xem Trước (Live Preview)',
    icon: Eye,
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#A33149] text-white flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">SONG HÀNH KÝ</div>
              <div className="text-[11px] font-medium text-slate-500">Thiệp kỷ niệm</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Đóng menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-rose-50 text-[#A33149] font-semibold border border-rose-200/70'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            <div className="font-semibold mb-0.5">Chế độ Frontend Mock</div>
            <p className="text-amber-700 leading-relaxed">
              Lưu trữ DB, xác thực PIN máy chủ và xuất bản link công khai đang chờ tích hợp từ OpenAI Codex.
            </p>
          </div>

          <NavLink
            to={`/ecd/game/${DEFAULT_ECARD_UUID}`}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
          >
            <span>Mở Thiệp Mẫu Người Nhận</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </aside>
    </>
  );
};
