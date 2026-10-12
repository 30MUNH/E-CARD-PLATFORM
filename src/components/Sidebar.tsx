import React from 'react';
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
      className="absolute left-4 top-4 w-10 h-10 z-[100]"
    >
      <img
        src="/template/icon_sidebar.png"
        alt="sidebar"
        className="w-full h-full object-contain"
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

  const visibleSlides =
    slides && slides.length > 0
      ? slides
      : SLIDES.filter((slide) => !(slide.id === 'video' && !hasVideo) && slide.id !== 'timeline');

  return (
    <div className="absolute inset-0 z-[120] bg-[#FFF9F5] flex flex-col w-2/3 md:w-80 h-full pointer-events-auto shadow-2xl">
      <div className="flex flex-col h-full overflow-auto mt-5">
        <div className="flex-1">
          {visibleSlides.map((slide, idx) => {
            const targetIndex = slides ? idx : SLIDES.findIndex((s) => s.id === slide.id);
            return (
              <button
                key={slide.id}
                onClick={() => {
                  setActiveIndex(targetIndex);
                  setIsOpen(false);
                }}
                onTouchStart={onTouchStart}
                className={`w-full text-left py-4 px-4 text-[#A33149] font-bold focus:outline-none hover:bg-[#FFE4E4]/60 transition ${
                  activeIndex === targetIndex ? 'bg-[#FFE4E4]' : ''
                }`}
              >
                <span className="text-2xl">{slide.title}</span>
              </button>
            );
          })}
        </div>
        <img
          src="/template/logo-font.png"
          alt="logo-mini"
          className="w-1/3 mx-auto mt-auto mb-[25vh]"
        />
      </div>
    </div>
  );
};
