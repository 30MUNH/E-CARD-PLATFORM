import React, { useEffect, useRef, useState } from 'react';
import { FloatingNavButtons } from './FloatingNavButtons';

interface GameViewProps {
  onBack: () => void;
  onNext: () => void;
}

const TOTAL_CARDS = 55;
const SHUFFLE_INTERVAL_MS = 300;
const SHUFFLE_DURATION_MS = 3000;
const cardFlipAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/tap.mp3') : null;

export const GameView: React.FC<GameViewProps> = ({ onBack, onNext }) => {
  const [cardSrc, setCardSrc] = useState('/template/game/main.png');
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCardIndexRef = useRef<number | null>(null);

  useEffect(() => {
    for (let i = 1; i <= TOTAL_CARDS; i++) {
      const img = new Image();
      img.src = `/template/game/card_${i}.png`;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const preloadCardImage = (src: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(src);
      img.onerror = reject;
    });

  const handleCardClick = () => {
    if (isShuffling) return;
    setIsShuffling(true);

    intervalRef.current = setInterval(async () => {
      let nextIdx = Math.floor(Math.random() * TOTAL_CARDS) + 1;
      while (nextIdx === lastCardIndexRef.current) {
        nextIdx = Math.floor(Math.random() * TOTAL_CARDS) + 1;
      }
      lastCardIndexRef.current = nextIdx;
      const nextSrc = `/template/game/card_${nextIdx}.png`;
      try {
        const loadedSrc = await preloadCardImage(nextSrc);
        setCardSrc(loadedSrc);
        if (cardFlipAudio) {
          cardFlipAudio.currentTime = 0;
          cardFlipAudio.play().catch(() => {});
        }
      } catch {
        console.warn('Failed to load image', nextSrc);
      }
    }, SHUFFLE_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsShuffling(false);
    }, SHUFFLE_DURATION_MS);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen space-y-4 px-4 w-full max-w-4xl mx-auto">
      {hasStarted ? (
        <>
          <img
            key={cardSrc}
            src={cardSrc}
            alt="card-game"
            onClick={handleCardClick}
            className={`w-72 md:w-80 lg:w-96 h-auto object-cover rounded-lg md:rounded-2xl md:shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-105 ${
              isShuffling ? 'animate-bounce-y ' : ''
            }`}
            style={{
              animation: isShuffling ? 'bounceY 0.6s ease-in-out infinite' : 'none',
            }}
          />
          <p className="hidden md:block text-sm font-medium text-[#A33149]/80 bg-white/80 px-4 py-1.5 rounded-full shadow-sm">
            {isShuffling ? 'Đang xáo bài...' : 'Chạm vào lá bài để rút thử thách mới'}
          </p>
          <style>{`
              @keyframes bounceY {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
            `}</style>
          <FloatingNavButtons
            onBack={onBack}
            onNext={onNext}
            bottomOffsetClass="bottom-[5vh]"
          />
        </>
      ) : (
        <>
          <div
            className="max-w-md md:max-w-lg text-sm md:text-base text-red-600 font-semibold leading-relaxed p-2 md:p-6 md:rounded-2xl md:shadow-xl"
            style={{
              background: 'linear-gradient(to right, #fbe3e3, #f8dada)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <p className="text-lg md:text-xl font-extrabold italic mb-1 md:mb-3 text-center">
              Hướng dẫn chơi:
            </p>
            <div className="flex flex-col font-bold italic space-y-2 text-left w-80 md:w-full">
              <p>1 - Thuyết phục người yêu, đối tác chơi chung.</p>
              <p>
                2 - Xáo bài lên, để úp xuống và lần lượt bốc bài và thực hiện theo yêu cầu trên lá
                bài.
              </p>
              <p>
                3 - Hãy cố gắng chơi hết bộ bài với tinh thần xây dựng và nói hết suy nghĩ trong
                lòng để 2 bên hiểu nhau hơn.
              </p>
            </div>
          </div>
          <button
            onClick={() => setHasStarted(true)}
            className="mt-4 bg-[#f8dada] text-red-600 px-6 py-2 md:px-8 md:py-3 font-extrabold rounded-full shadow hover:bg-red-600 hover:text-white transition"
          >
            Bắt đầu
          </button>
          <FloatingNavButtons
            onBack={onBack}
            onNext={onNext}
            bottomOffsetClass="bottom-[8vh]"
          />
        </>
      )}
    </div>
  );
};
