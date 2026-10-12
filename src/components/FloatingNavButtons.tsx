import React from 'react';

interface FloatingNavButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  bottomOffsetClass?: 'bottom-[5vh]' | 'bottom-[8vh]';
}

export const FloatingNavButtons: React.FC<FloatingNavButtonsProps> = ({
  onBack,
  onNext,
  bottomOffsetClass = 'bottom-[5vh]',
}) => {
  return (
    <>
      {onBack && (
        <button
          onClick={onBack}
          className={`fixed ${bottomOffsetClass} left-[10vw] transform -translate-x-1/2 rounded-full py-2 text-base font-medium  transition active:scale-95 z-50`}
        >
          <img
            src="/template/back.png"
            alt="arrow-right"
            className="w-12 h-12 animate-wiggle-x"
          />
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          className={`fixed ${bottomOffsetClass} right-0 transform -translate-x-1/2 rounded-full py-2 text-base font-medium  transition active:scale-95 z-50`}
        >
          <img
            src="/template/next.png"
            alt="arrow-right"
            className="w-12 h-12 animate-wiggle-x"
          />
        </button>
      )}
    </>
  );
};
