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
  coupleNames,
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
    <div
      className="overflow-hidden flex flex-col items-center justify-between md:justify-center grow min-h-full w-full bg-cover bg-center px-6 pt-8 pb-[max(3rem,env(safe-area-inset-bottom))]"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Tablet & Desktop Editorial Invitation Header (hidden on mobile to preserve exact mobile visual match) */}
      <div className="hidden md:flex flex-col items-center text-center bg-white/80 backdrop-blur-md rounded-3xl px-10 py-8 shadow-xl border border-rose-100/80 max-w-lg mb-8">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-3">
          <Heart className="w-6 h-6 text-[#A33149] fill-[#A33149] animate-pulse motion-reduce:animate-none" />
        </div>
        {welcomeConfig?.heading && (
          <h1
            className="text-3xl lg:text-4xl text-[#A33149] mb-2"
            style={{ fontFamily: 'Pacifico, cursive', fontWeight: 400 }}
          >
            {welcomeConfig.heading}
          </h1>
        )}
        {coupleNames && (
          <p className="text-lg font-semibold text-[#8c5261] mb-1">
            {coupleNames.femaleName} &amp; {coupleNames.maleName}
          </p>
        )}
        {welcomeConfig?.subheading && (
          <p className="text-sm text-gray-600">{welcomeConfig.subheading}</p>
        )}
      </div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        className="bg-[#A33149] hover:bg-[#8e283e] text-white rounded-full px-12 py-3 md:px-14 md:py-4 text-xl font-semibold shadow-md active:scale-95 transition mb-10 mt-[75vh] md:mt-0 md:mb-0"
      >
        {buttonLabel}
      </motion.button>
    </div>
  );
};
