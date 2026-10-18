import React, { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Heart, LockKeyhole } from 'lucide-react';
import { getAdminAccessToken, signInAdmin } from '../../services/api/auth';
import { isApiMode } from '../../services/api/config';

export const AdminLoginPage: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};

  if (!isApiMode()) return <Navigate to="/admin" replace />;
  if (getAdminAccessToken()) return <Navigate to={(location.state as { from?: string } | null)?.from || '/admin'} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signInAdmin(email.trim(), password, {
        url: env.VITE_SUPABASE_URL || '',
        anonKey: env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '',
        apiBaseUrl: env.VITE_ECARD_API_BASE_URL || '',
      });
      window.location.assign((location.state as { from?: string } | null)?.from || '/admin');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể đăng nhập. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-rose-50 px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-rose-100 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A33149] text-white">
            <Heart className="h-7 w-7 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SONG HÀNH KÝ</h1>
          <p className="mt-1 text-sm text-slate-500">Đăng nhập quản trị thiệp</p>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Mật khẩu
          <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#A33149] px-4 py-3 font-semibold text-white disabled:opacity-60" type="submit" disabled={isSubmitting}>
          <LockKeyhole className="h-4 w-4" /> {isSubmitting ? 'Đang xác minh…' : 'Đăng nhập'}
        </button>
        <p className="text-center text-xs text-slate-500"><Link to="/" className="underline">Quay lại trang thiệp</Link></p>
      </form>
    </main>
  );
};
