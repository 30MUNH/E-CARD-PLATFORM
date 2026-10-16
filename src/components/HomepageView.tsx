import React from 'react';
import { CalendarHeart, Heart } from 'lucide-react';
import { EcardPreloadData, resolveImageUrl, SlideDefinition } from '../data/ecardData';
import { FloatingNavButtons } from './FloatingNavButtons';

interface HomepageViewProps {
  ecardId: string;
  loveDays: number;
  handleCardChange: (slideId: SlideDefinition['id']) => void;
  preloadedData: EcardPreloadData;
  onNext: () => void;
  hasTimeline?: boolean;
}

export const HomepageView: React.FC<HomepageViewProps> = ({
  loveDays,
  handleCardChange,
  preloadedData,
  onNext,
  hasTimeline = false,
}) => {
  return (
    <div className="p-4 md:p-6 lg:p-10 w-full max-w-full sm:max-w-md md:max-w-3xl lg:max-w-5xl sm:mx-auto">
      <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-10 md:items-center md:bg-white/75 md:backdrop-blur-md md:rounded-3xl p-2 md:p-6 lg:p-8 md:shadow-xl md:border md:border-rose-100">
        {/* Left Column on Tablet & Desktop: Hero Couple Photo + Shortcut Icons */}
        <div className="w-full px-2 pb-3 md:px-0 md:pb-0 md:col-span-6">
          <button
            onClick={() => handleCardChange('album')}
            className="w-full aspect-square rounded-xl md:rounded-2xl overflow-hidden md:shadow-lg group relative"
          >
            <img
              src={resolveImageUrl(preloadedData.homepageData.homepage_image)}
              alt="big"
              className="w-full h-full object-cover rounded-xl md:rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
            />
          </button>
          <div className="mt-4 flex justify-between gap-3 sm:gap-4 md:justify-center lg:justify-start">
            <button
              onClick={() => handleCardChange('music')}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl p-2 flex items-center justify-center md:bg-white/70 md:shadow-sm md:hover:scale-105 transition"
              title="Nghe Voice kỷ niệm"
            >
              <img
                src="/template/icon_music.png"
                alt="music"
                className="w-full h-full object-contain"
              />
            </button>
            <button
              onClick={() => handleCardChange('letter')}
              className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl p-2 flex items-center justify-center md:bg-white/70 md:shadow-sm md:hover:scale-105 transition"
              title="Đọc thư tình"
            >
              <img
                src="/template/icon_letter.png"
                alt="letter"
                className="w-full h-full object-contain"
              />
              <span className="absolute top-3 right-0 translate-x-1/4 -translate-y-1/4 bg-red-600 text-white text-lg w-7 h-7 flex items-center justify-center rounded-full font-bold shadow-md">
                1
              </span>
            </button>
            {preloadedData.hasVideo && (
              <button
                onClick={() => handleCardChange('video')}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl p-2 flex items-center justify-center md:bg-white/70 md:shadow-sm md:hover:scale-105 transition"
                title="Xem video kỷ niệm"
              >
                <img
                  src="/template/icon_video.png"
                  alt="video"
                  className="w-full h-full object-contain"
                />
              </button>
            )}
            {hasTimeline && (
              <button
                onClick={() => handleCardChange('timeline')}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl p-2 flex flex-col items-center justify-center bg-white/80 text-[#A33149] shadow-sm hover:scale-105 transition"
                title="Cột mốc tình yêu"
              >
                <CalendarHeart className="w-9 h-9 mb-1" />
                <span className="text-xs font-semibold">Cột mốc</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column on Tablet & Desktop: Couple Names & Live Love Counter */}
        {preloadedData.ecardData.template_id !== 'b8770825-3bb7-47af-aff1-1d4aa17975d9' && (
          <div className="px-2 pb-3 mt-auto md:px-0 md:pb-0 md:mt-0 md:col-span-6 flex flex-col justify-center">
            <div className="hidden md:block mb-4 lg:mb-6 text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-[#A33149] text-xs font-semibold tracking-wider uppercase mb-2">
                Lưu giữ kỷ niệm
              </span>
              <h2
                className="text-2xl md:text-3xl lg:text-4xl text-[#A33149] leading-snug"
                style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive", fontWeight: '700' }}
              >
                Hành trình yêu thương
              </h2>
              {preloadedData.homepageData.tagline && (
                <p className="text-sm text-gray-600 mt-1">{preloadedData.homepageData.tagline}</p>
              )}
            </div>

            <div className="bg-[#e4e3e4] md:bg-[#f2e8eb] rounded-2xl py-3 px-2 sm:px-3 md:py-4 md:px-3 lg:py-6 lg:px-6 md:shadow-md">
              <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                {/* Female Column */}
                <div className="flex flex-col items-center justify-start text-center min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 shrink-0 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
                    <img
                      src={resolveImageUrl(preloadedData.homepageData.avatar_female)}
                      className="w-full h-full object-cover rounded-full animate-spin-slow motion-reduce:animate-none shrink-0"
                      alt="avatar-1"
                    />
                  </div>
                  <span
                    className="w-full text-center text-[#A33149] text-sm sm:text-base md:text-sm lg:text-lg font-bold mt-2 px-1 leading-snug line-clamp-2 break-words"
                    style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive", fontWeight: '700' }}
                    title={preloadedData.ecardData.female_name}
                  >
                    {preloadedData.ecardData.female_name}
                  </span>
                </div>

                {/* Days Counter Column */}
                <div className="flex flex-col items-center justify-center text-center shrink-0 px-1 sm:px-2 md:px-1 lg:px-3 pt-1">
                  <Heart
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 lg:w-11 lg:h-11 animate-[pulse_1s_ease-in-out_infinite] motion-reduce:animate-none shrink-0"
                    fill="#FF0000"
                    style={{ stroke: '#e4e3e4', strokeWidth: 2 }}
                  />
                  <div className="text-[#A33149] text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold leading-tight mt-0.5">
                    {loveDays}
                  </div>
                  <div
                    className="text-[#A33149] text-xs sm:text-sm md:text-sm lg:text-base font-medium"
                    style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive", fontWeight: '600' }}
                  >
                    ngày
                  </div>
                </div>

                {/* Male Column */}
                <div className="flex flex-col items-center justify-start text-center min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 shrink-0 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
                    <img
                      src={resolveImageUrl(preloadedData.homepageData.avatar_male)}
                      className="w-full h-full object-cover rounded-full animate-spin-slow motion-reduce:animate-none shrink-0"
                      alt="avatar-2"
                    />
                  </div>
                  <span
                    className="w-full text-center text-[#A33149] text-sm sm:text-base md:text-sm lg:text-lg font-bold mt-2 px-1 leading-snug line-clamp-2 break-words"
                    style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive", fontWeight: '700' }}
                    title={preloadedData.ecardData.male_name}
                  >
                    {preloadedData.ecardData.male_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FloatingNavButtons onNext={onNext} />
    </div>
  );
};
