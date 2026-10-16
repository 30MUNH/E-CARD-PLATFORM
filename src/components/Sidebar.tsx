import React from 'react';
import { X } from 'lucide-react';
import { SLIDES, SlideDefinition } from '../data/ecardData';

interface SidebarToggleButtonProps {
  toggleSidebar: () => void;
  onTouchStart?: () => void;
}

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  toggleSidebar,
  onTouchStart,
}) => {
  return (
    <button
      onClick={toggleSidebar}
      onTouchStart={onTouchStart}
      className="fixed left-4 top-4 w-10 h-10 z-[100] active:scale-95 transition focus:outline-none"
      aria-label="Mở menu điều hướng"
      title="Menu điều hướng"
    >
      <img
        src="/template/icon_sidebar.png"
        alt="sidebar"
        className="w-full h-full object-contain drop-shadow-sm"
      />
    </button>
  );
};

interface SidebarDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  hasVoice: boolean;
  hasVideo: boolean;
  slides?: SlideDefinition[];
  onTouchStart?: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  setIsOpen,
  activeIndex,
  setActiveIndex,
  hasVideo,
  slides,
  onTouchStart,
}) => {
  if (!isOpen) return null;

  // Filter out any setting slide and respect video/timeline visibility
  const baseSlides = slides && slides.length > 0 ? slides : SLIDES;
  const visibleSlides = baseSlides.filter(
    (slide) =>
      slide.id !== 'setting' &&
      !(slide.id === 'video' && !hasVideo)
  );

  return (
    <div
      className="fixed inset-y-0 left-0 z-[120] bg-[#FFF9F5] flex flex-col w-[75vw] max-w-xs md:w-80 h-full pointer-events-auto shadow-2xl animate-in slide-in-from-left duration-300"
      role="dialog"
      aria-label="Menu điều hướng"
    >
      {/* Header with Close Button */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <span className="text-xs font-semibold text-[#A33149]/70 uppercase tracking-wider">
          Điều hướng
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#A33149] hover:bg-[#FFE4E4] transition"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Navigation Links */}
      <div className="flex flex-col flex-1 overflow-y-auto py-2">
        {visibleSlides.map((slide, idx) => {
          const targetIndex = slides ? idx : SLIDES.findIndex((s) => s.id === slide.id);
          const isActive = activeIndex === targetIndex;
          return (
            <button
              key={slide.id}
              onClick={() => {
                setActiveIndex(targetIndex);
                setIsOpen(false);
              }}
              onTouchStart={onTouchStart}
              className={`w-full text-left py-4 px-6 text-[#A33149] font-bold focus:outline-none transition flex items-center justify-between ${
                isActive
                  ? 'bg-[#FFE4E4] text-[#8A2B3D] border-l-4 border-[#8A2B3D]'
                  : 'hover:bg-[#FFE4E4]/60'
              }`}
            >
              <span className="text-2xl font-bold">{slide.title}</span>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-[#8A2B3D]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom "Thẻ tình yêu" Logo matching Image 1 */}
      <div className="mt-auto pb-8 pt-4 flex flex-col items-center justify-center border-t border-rose-100/60">
        <img
          src="/template/logo-font.png"
          alt="Thẻ tình yêu"
          className="w-28 md:w-32 object-contain"
        />
      </div>
    </div>
  );
};
