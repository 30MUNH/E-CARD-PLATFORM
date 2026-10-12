import React, { useRef } from 'react';
import { isIOSOrMobileSafari, unlockSafariIOSAudio } from '../context/MediaContext';

interface WelcomeScreenProps {
  onStart: () => void;
  onTouchStart?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onTouchStart }) => {
  const clickLockRef = useRef(false);
  const touchLockRef = useRef(false);

  const handleClick = () => {
    if (clickLockRef.current) return;
    clickLockRef.current = true;
    if (isIOSOrMobileSafari()) {
      unlockSafariIOSAudio();
    }
    onStart();
    setTimeout(() => {
      clickLockRef.current = false;
    }, 1000);
  };

  const handleTouchStart = () => {
    if (!touchLockRef.current && onTouchStart) {
      onTouchStart();
    }
  };

  return (
    <div className="overflow-hidden flex flex-col items-center justify-between grow min-h-full bg-[url('/template/background-welcome.png')] bg-cover bg-center px-6 pt-8 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <button
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        className="bg-[#A33149] text-white rounded-full px-12 py-3 text-xl font-semibold shadow-md active:scale-95 transition mb-10 mt-[75vh]"
      >
        Bắt đầu
      </button>
    </div>
  );
};
