import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { isIOSOrMobileSafari, unlockSafariIOSAudio } from '../context/MediaContext';
import { WelcomeConfig } from '../types/ecard';

interface WelcomeScreenProps {
  onStart: () => void;
  onTouchStart?: () => void;
  welcomeConfig?: WelcomeConfig;
  coupleNames?: { femaleName: string; maleName: string };
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  onTouchStart,
  welcomeConfig,
}) => {
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

  const bgImage = welcomeConfig?.backgroundImage || '/template/background-welcome.png';
  const buttonLabel = welcomeConfig?.buttonLabel || 'Bắt đầu';

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FAF7F2]">
      {/* Center Welcome Card with Dashed Heart & Thẻ Tình Yêu Logo */}
      <div
        className="w-full max-w-md h-screen max-h-[920px] flex flex-col items-center justify-between bg-cover md:bg-contain bg-center bg-no-repeat px-6 pt-10 pb-[max(3rem,env(safe-area-inset-bottom))] relative"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="flex-1" />

        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          className="bg-[#8A2B3D] hover:bg-[#782434] text-white rounded-full px-12 py-3 md:px-14 md:py-3.5 text-xl font-semibold shadow-lg active:scale-95 transition mb-6"
        >
          {buttonLabel}
        </motion.button>
      </div>
    </div>
  );
};
