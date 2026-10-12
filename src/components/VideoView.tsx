import React from 'react';
import { FloatingNavButtons } from './FloatingNavButtons';

interface VideoViewProps {
  ecardId: string;
  videoUrl: string | null | undefined;
  onBack: () => void;
  onNext: () => void;
}

export const VideoView: React.FC<VideoViewProps> = ({ videoUrl, onBack, onNext }) => {
  if (!videoUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">Không có video</p>
      </div>
    );
  }

  return (
    <div className="w-[70%] h-[70%] flex items-center justify-center">
      <video
        src={videoUrl}
        controls
        preload="metadata"
        className="w-full h-full object-contain"
        playsInline
      />
      <FloatingNavButtons
        onBack={onBack}
        onNext={onNext}
        bottomOffsetClass="bottom-[5vh]"
      />
    </div>
  );
};
