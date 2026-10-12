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
  const { love_letters, avatars } = preloadedData.letterData;

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-6 text-[#A33149] h-[100vh]">
      <div className="h-[80vh] overflow-y-auto px-2 mt-10">
        <div className="min-h-full flex flex-col justify-center space-y-6">
          <div className="text-left sm:text-[15px] space-y-4 px-2">
            {love_letters.length > 0 ? (
              <TypewriterText letters={love_letters} />
            ) : (
              <p style={{ fontFamily: 'Pacifico, cursive', fontWeight: '400' }}>
                (Chưa có nội dung thư tình)
              </p>
            )}
          </div>

          {avatars.length > 0 && (
            <div className="flex justify-center gap-4 mt-4">
              <HeartClippedAvatar imageUrl={resolveImageUrl(avatars[0])} size={100} />
              <HeartClippedAvatar imageUrl={resolveImageUrl(avatars[1])} size={100} />
            </div>
          )}
        </div>
      </div>

      <FloatingNavButtons
        onBack={onBack}
        onNext={onNext}
        bottomOffsetClass="bottom-[5vh]"
      />
    </div>
  );
};
