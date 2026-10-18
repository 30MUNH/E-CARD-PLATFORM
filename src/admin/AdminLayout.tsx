import React, { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Menu, Plus } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { clearAdminAccessToken, getAdminAccessToken } from '../services/api/auth';
import { isApiMode } from '../services/api/config';

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const apiMode = isApiMode();

  if (apiMode && !getAdminAccessToken()) {
    return <Navigate to="/admin/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      <AdminSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Mở menu quản trị"
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>

          <div className="flex items-center gap-3">
            {apiMode && <button type="button" onClick={() => { clearAdminAccessToken(); window.location.assign('/admin/login'); }} className="text-sm font-medium text-slate-600 hover:text-rose-700">Đăng xuất</button>}
            <Link
              to="/admin/cards/new"
              className="inline-flex items-center gap-2 bg-[#A33149] hover:bg-[#8e283e] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Thiệp Mới</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};
