import React from 'react';
import { Heart } from 'lucide-react';
import { EcardPreloadData, resolveImageUrl, SlideDefinition } from '../data/ecardData';
import { FloatingNavButtons } from './FloatingNavButtons';

interface HomepageViewProps {
  ecardId: string;
  loveDays: number;
  handleCardChange: (slideId: SlideDefinition['id']) => void;
  preloadedData: EcardPreloadData;
  onNext: () => void;
}

export const HomepageView: React.FC<HomepageViewProps> = ({
  loveDays,
  handleCardChange,
  preloadedData,
  onNext,
}) => {
  return (
    <div className="p-4 w-full max-w-full sm:max-w-sm sm:mx-auto">
      <div className="w-full px-4 pb-4">
        <button
          onClick={() => handleCardChange('album')}
          className="w-full aspect-square rounded-xl overflow-hidden"
        >
          <img
            src={resolveImageUrl(preloadedData.homepageData.homepage_image)}
            alt="big"
            className="w-full h-full object-cover rounded-xl"
          />
        </button>
        <div className="mt-4 flex justify-between gap-4 justify-start">
          <button
            onClick={() => handleCardChange('music')}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl p-2 flex items-center justify-center"
          >
            <img
              src="/template/icon_music.png"
              alt="music"
              className="w-full h-full object-contain"
            />
          </button>
          <button
            onClick={() => handleCardChange('letter')}
            className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl p-2 flex items-center justify-center"
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
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl p-2 flex items-center justify-center"
            >
              <img
                src="/template/icon_video.png"
                alt="video"
                className="w-full h-full object-contain"
              />
            </button>
          )}
        </div>
      </div>

      {preloadedData.ecardData.template_id !== 'b8770825-3bb7-47af-aff1-1d4aa17975d9' && (
        <div className="px-4 pb-4 mt-auto">
          <div className="flex items-center justify-between bg-[#e4e3e4] rounded-2xl py-3 px-4">
            <div className="flex flex-col items-center">
              <img
                src={resolveImageUrl(preloadedData.homepageData.avatar_female)}
                className="w-20 h-20 rounded-full object-cover mb-1 animate-spin-slow"
                alt="avatar-1"
              />
              <p
                className="text-[#A33149] text-lg font-bold"
                style={{ fontFamily: 'Pacifico, cursive', fontWeight: '400' }}
              >
                {preloadedData.ecardData.female_name}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <Heart
                className="w-10 h-10 animate-[pulse_1s_ease-in-out_infinite]"
                fill="#FF0000"
                style={{ stroke: '#e4e3e4', strokeWidth: 2 }}
              />
              <div className="text-[#A33149] text-3xl font-bold">{loveDays}</div>
              <div
                className="text-[#A33149] text-sm font-medium"
                style={{ fontFamily: 'Pacifico, cursive', fontWeight: '400' }}
              >
                ngày
              </div>
            </div>

            <div className="flex flex-col items-center">
              <img
                src={resolveImageUrl(preloadedData.homepageData.avatar_male)}
                className="w-20 h-20 rounded-full object-cover mb-1 animate-spin-slow"
                alt="avatar-2"
              />
              <p
                className="text-[#A33149] text-lg font-bold"
                style={{ fontFamily: 'Pacifico, cursive', fontWeight: '400' }}
              >
                {preloadedData.ecardData.male_name}
              </p>
            </div>
          </div>
        </div>
      )}

      <FloatingNavButtons onNext={onNext} bottomOffsetClass="bottom-[5vh]" />
    </div>
  );
};
