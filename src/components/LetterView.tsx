import React from 'react';
import { EcardPreloadData, resolveImageUrl } from '../data/ecardData';
import { TypewriterText } from './TypewriterText';
import { HeartClippedAvatar } from './HeartClippedAvatar';
import { FloatingNavButtons } from './FloatingNavButtons';

interface LetterViewProps {
  ecardId: string;
  isActive?: boolean;
  preloadedData: EcardPreloadData;
  onBack: () => void;
  onNext: () => void;
}

export const LetterView: React.FC<LetterViewProps> = ({
  preloadedData,
  onBack,
  onNext,
}) => {
  const { love_letters, avatars, audio_url } = preloadedData.letterData;

  return (
    <div className="w-full max-w-sm md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-6 text-[#A33149] h-[100vh] md:h-auto">
      <div className="h-[80vh] md:h-auto md:max-h-[78vh] overflow-y-auto px-2 mt-10 md:mt-4 md:bg-[#FFFDF9]/90 md:backdrop-blur-md md:rounded-3xl md:shadow-2xl md:border md:border-rose-100 md:p-10 lg:p-12">
        <div className="min-h-full flex flex-col justify-center space-y-6">
          {audio_url && (
            <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-3 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#8c5261]">
                Lời nhắn thoại đính kèm
              </span>
              <audio controls src={audio_url} className="w-full h-9" />
            </div>
          )}

          <div className="text-left sm:text-[15px] md:text-base lg:text-lg md:leading-relaxed space-y-4 px-2">
            {love_letters.length > 0 ? (
              <TypewriterText letters={love_letters} />
            ) : (
              <p style={{ fontFamily: 'Pacifico, cursive', fontWeight: '400' }}>
                (Chưa có nội dung thư tình)
              </p>
            )}
          </div>

          {avatars.length > 0 && (
            <div className="flex justify-center gap-4 md:gap-8 mt-4 pt-2">
              <HeartClippedAvatar imageUrl={resolveImageUrl(avatars[0])} size={100} />
              {avatars[1] && (
                <HeartClippedAvatar imageUrl={resolveImageUrl(avatars[1])} size={100} />
              )}
            </div>
          )}
        </div>
      </div>

      <FloatingNavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
};
