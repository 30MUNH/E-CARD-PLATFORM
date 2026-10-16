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
    <div className="p-4 md:p-8 lg:p-10 w-full max-w-full sm:max-w-sm md:max-w-2xl lg:max-w-5xl sm:mx-auto">
      <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-center lg:bg-white/75 lg:backdrop-blur-md lg:rounded-3xl lg:p-8 lg:shadow-xl lg:border lg:border-rose-100">
        {/* Left Column on Desktop: Hero Couple Photo + Shortcut Icons */}
        <div className="w-full px-4 pb-4 lg:px-0 lg:pb-0 lg:col-span-6">
          <button
            onClick={() => handleCardChange('album')}
            className="w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-xl md:rounded-2xl overflow-hidden md:shadow-lg group relative"
          >
            <img
              src={resolveImageUrl(preloadedData.homepageData.homepage_image)}
              alt="big"
              className="w-full h-full object-cover rounded-xl md:rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
            />
          </button>
          <div className="mt-4 flex justify-between gap-4 justify-start md:justify-center lg:justify-start">
            <button
              onClick={() => handleCardChange('music')}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl p-2 flex items-center justify-center md:bg-white/70 md:shadow-sm md:hover:scale-105 transition"
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
              className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl p-2 flex items-center justify-center md:bg-white/70 md:shadow-sm md:hover:scale-105 transition"
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
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl p-2 flex items-center justify-center md:bg-white/70 md:shadow-sm md:hover:scale-105 transition"
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
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl p-2 flex flex-col items-center justify-center bg-white/80 text-[#A33149] shadow-sm hover:scale-105 transition"
                title="Cột mốc tình yêu"
              >
                <CalendarHeart className="w-9 h-9 mb-1" />
                <span className="text-xs font-semibold">Cột mốc</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column on Desktop: Couple Names & Live Love Counter */}
        {preloadedData.ecardData.template_id !== 'b8770825-3bb7-47af-aff1-1d4aa17975d9' && (
          <div className="px-4 pb-4 mt-auto lg:px-0 lg:pb-0 lg:mt-0 lg:col-span-6 flex flex-col justify-center">
            <div className="hidden lg:block mb-6 text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-[#A33149] text-xs font-semibold tracking-wider uppercase mb-2">
                Lưu giữ kỷ niệm
              </span>
              <h2
                className="text-3xl xl:text-4xl text-[#A33149] leading-snug"
                style={{ fontFamily: 'Pacifico, cursive', fontWeight: '400' }}
              >
                Hành trình yêu thương
              </h2>
              {preloadedData.homepageData.tagline && (
                <p className="text-sm text-gray-600 mt-1">{preloadedData.homepageData.tagline}</p>
              )}
            </div>

            <div className="bg-[#e4e3e4] md:bg-[#f2e8eb] rounded-2xl py-3 px-3 md:py-6 md:px-6 md:shadow-md">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4">
                {/* Female Column */}
                <div className="flex flex-col items-center min-w-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src={resolveImageUrl(preloadedData.homepageData.avatar_female)}
                      className="w-full h-full object-cover rounded-full animate-spin-slow motion-reduce:animate-none shrink-0"
                      alt="avatar-1"
                    />
                  </div>
                  <p
                    className="w-full text-center text-[#A33149] text-base md:text-xl font-bold truncate mt-1.5 px-1 leading-normal"
                    style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive", fontWeight: '700' }}
                    title={preloadedData.ecardData.female_name}
                  >
                    {preloadedData.ecardData.female_name}
                  </p>
                </div>

                {/* Days Counter Column */}
                <div className="flex flex-col items-center justify-center text-center shrink-0 px-1 sm:px-3">
                  <Heart
                    className="w-9 h-9 md:w-11 md:h-11 animate-[pulse_1s_ease-in-out_infinite] motion-reduce:animate-none shrink-0"
                    fill="#FF0000"
                    style={{ stroke: '#e4e3e4', strokeWidth: 2 }}
                  />
                  <div className="text-[#A33149] text-3xl md:text-4xl font-bold leading-tight mt-0.5">
                    {loveDays}
                  </div>
                  <div
                    className="text-[#A33149] text-sm md:text-base font-medium"
                    style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive", fontWeight: '600' }}
                  >
                    ngày
                  </div>
                </div>

                {/* Male Column */}
                <div className="flex flex-col items-center min-w-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src={resolveImageUrl(preloadedData.homepageData.avatar_male)}
                      className="w-full h-full object-cover rounded-full animate-spin-slow motion-reduce:animate-none shrink-0"
                      alt="avatar-2"
                    />
                  </div>
                  <p
                    className="w-full text-center text-[#A33149] text-base md:text-xl font-bold truncate mt-1.5 px-1 leading-normal"
                    style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive", fontWeight: '700' }}
                    title={preloadedData.ecardData.male_name}
                  >
                    {preloadedData.ecardData.male_name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FloatingNavButtons onNext={onNext} bottomOffsetClass="bottom-[5vh]" />
    </div>
  );
};
