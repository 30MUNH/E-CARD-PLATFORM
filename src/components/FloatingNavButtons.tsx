import React from 'react';

interface FloatingNavButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  bottomOffsetClass?: string;
}

export const FloatingNavButtons: React.FC<FloatingNavButtonsProps> = ({
  onBack,
  onNext,
  bottomOffsetClass = 'bottom-5 sm:bottom-6 md:bottom-8',
}) => {
  return (
    <>
      {onBack && (
        <button
          onClick={onBack}
          type="button"
          aria-label="Trang trước"
          className={`fixed ${bottomOffsetClass} left-4 sm:left-6 md:left-8 rounded-full p-1 transition active:scale-95 z-50`}
        >
          <img
            src="/template/back.png"
            alt="arrow-back"
            className="w-12 h-12 animate-wiggle-x drop-shadow-md"
          />
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          type="button"
          aria-label="Trang tiếp theo"
          className={`fixed ${bottomOffsetClass} right-4 sm:right-6 md:right-8 rounded-full p-1 transition active:scale-95 z-50`}
        >
          <img
            src="/template/next.png"
            alt="arrow-next"
            className="w-12 h-12 animate-wiggle-x drop-shadow-md"
          />
        </button>
      )}
    </>
  );
};

