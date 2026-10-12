import React, { useEffect, useState } from 'react';

function isZaloBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.toLowerCase().includes('zalo');
}

function openExternalBrowser(): void {
  const currentUrl = window.location.href;
  const cleanUrl = currentUrl.replace(/^https?:\/\//, '');
  const targetUrl = /iPad|iPhone|iPod/.test(navigator.userAgent)
    ? `googlechrome://${cleanUrl}`
    : `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
  window.location.href = targetUrl;
  setTimeout(() => {
    window.open(currentUrl, '_blank');
  }, 1000);
}

export const ZaloBrowserModal: React.FC = () => {
  const [open, setOpen] = useState(isZaloBrowser);

  useEffect(() => {
    if (isZaloBrowser()) {
      const timer = setTimeout(() => {
        openExternalBrowser();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight bg-[#BB254E] text-white p-2 rounded">
            Chuyển trình duyệt
          </h2>
          <p className="text-sm text-gray-600 pt-2">
            Để có trải nghiệm tốt nhất, vui lòng mở trang web này trong trình duyệt mặc định của
            bạn.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 border rounded-md text-sm font-medium"
          >
            Đóng
          </button>
          <button
            onClick={openExternalBrowser}
            className="px-4 py-2 bg-[#A33149] text-white rounded-md text-sm font-medium"
          >
            Mở trong trình duyệt
          </button>
        </div>
      </div>
    </div>
  );
};
