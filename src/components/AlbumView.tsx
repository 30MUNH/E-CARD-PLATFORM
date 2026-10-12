import React, { useEffect, useRef, useState } from 'react';
import { EcardPreloadData, resolveImageUrl } from '../data/ecardData';
import { FloatingNavButtons } from './FloatingNavButtons';

interface AlbumViewProps {
  images: string[];
  ecardId: string;
  preloadedData: EcardPreloadData;
  onBack: () => void;
  onNext: () => void;
}

function chunkIntoThrees(items: string[]): string[][] {
  const groups: string[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    groups.push(items.slice(i, i + 3));
  }
  return groups;
}

export const AlbumView: React.FC<AlbumViewProps> = ({
  images,
  preloadedData,
  onBack,
  onNext,
}) => {
  const defaultImages = Array.from({ length: 12 }, (_, idx) => `/template/image-${idx + 1}.jpg`);
  const albumImages =
    preloadedData.albumData && preloadedData.albumData.length > 0
      ? preloadedData.albumData.map((item) => item.image_url)
      : images && images.length > 0
      ? images
      : defaultImages;

  const [captions, setCaptions] = useState<string[]>(
    Array(albumImages.length).fill('Khoảnh khắc đáng nhớ 💖')
  );

  useEffect(() => {
    if (preloadedData.albumData) {
      setCaptions(
        albumImages.map(
          (url) =>
            preloadedData.albumData.find((item) => item.image_url === url)?.caption ||
            'Khoảnh khắc đáng nhớ 💖'
        )
      );
    }
  }, [preloadedData.albumData, albumImages]);

  const groups = chunkIntoThrees(albumImages);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const expandedImgRef = useRef<HTMLImageElement | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.changedTouches[0].screenX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = () => {
    if (
      touchStartXRef.current !== null &&
      touchEndXRef.current !== null &&
      Math.abs(touchStartXRef.current - touchEndXRef.current) > 50
    ) {
      if (touchStartXRef.current > touchEndXRef.current) {
        setSelectedIndex((prev) =>
          prev !== null && prev < albumImages.length - 1 ? prev + 1 : prev
        );
      } else {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const closeModal = () => setSelectedIndex(null);

  useEffect(() => {
    if (!expandedImgRef.current) return;
    const img = expandedImgRef.current;
    const checkAspectRatio = () => {
      if (img.naturalWidth > 0 && img.naturalHeight / img.naturalWidth >= 1.5) {
        setIsPortrait(true);
      } else {
        setIsPortrait(false);
      }
    };
    if (img.complete) {
      checkAspectRatio();
    } else {
      img.onload = checkAspectRatio;
    }
  }, [selectedIndex]);

  return (
    <div className="w-full z-0">
      <div className="flex flex-col items-center gap-2 p-2 max-h-[75vh] overflow-y-auto">
        {groups[0] && (
          <div className="flex gap-2 w-full max-w-2xl">
            <img
              src={resolveImageUrl(groups[0][0])}
              alt="group1-img0"
              className="w-[58%] aspect-square object-cover scale-[0.9] cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedIndex(0)}
            />
            <div className="flex flex-col justify-between w-[40%] gap-2">
              {groups[0][1] && (
                <img
                  src={resolveImageUrl(groups[0][1])}
                  alt="group1-img1"
                  className="w-full aspect-square object-cover scale-[0.9] cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedIndex(1)}
                />
              )}
              {groups[0][2] && (
                <img
                  src={resolveImageUrl(groups[0][2])}
                  alt="group1-img2"
                  className="w-full aspect-square object-cover scale-[0.9] cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedIndex(2)}
                />
              )}
            </div>
          </div>
        )}

        {groups[1] && (
          <div className="flex gap-2 w-full max-w-2xl">
            <div className="flex flex-col justify-between w-[40%] gap-2">
              {groups[1][1] && (
                <img
                  src={resolveImageUrl(groups[1][1])}
                  alt="group2-img1"
                  className="w-full aspect-square object-cover scale-[0.9] cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedIndex(4)}
                />
              )}
              {groups[1][2] && (
                <img
                  src={resolveImageUrl(groups[1][2])}
                  alt="group2-img2"
                  className="w-full aspect-square object-cover scale-[0.9] cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedIndex(5)}
                />
              )}
            </div>
            {groups[1][0] && (
              <img
                src={resolveImageUrl(groups[1][0])}
                alt="group2-img0"
                className="w-[58%] aspect-square object-cover scale-[0.9] cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedIndex(3)}
              />
            )}
          </div>
        )}

        {groups[2] && (
          <div className="flex justify-center gap-2 w-full max-w-2xl px-2 py-2">
            {groups[2].map((imgUrl, idx) => (
              <img
                key={idx}
                src={resolveImageUrl(imgUrl)}
                alt={`group3-img${idx}`}
                className="w-1/3 aspect-square object-cover scale-[0.9] cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedIndex(6 + idx)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`bg-white p-2 rounded-md shadow-2xl sm:w-[50%] z-[130] flex flex-col items-center overflow-hidden transition-transform duration-300 ${
              isPortrait ? 'scale-[0.75] ' : 'scale-[0.95]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              ref={expandedImgRef}
              src={resolveImageUrl(albumImages[selectedIndex])}
              alt="expanded"
              className={`object-contain rounded-sm ${
                isPortrait ? 'w-auto max-h-[80%]' : 'w-full max-h-[70%]'
              }`}
            />
            <p
              className="mt-2 text-lg text-gray-700 text-center px-3 break-words leading-snug"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              {captions[selectedIndex]}
            </p>
          </div>
        </div>
      )}

      <FloatingNavButtons
        onBack={onBack}
        onNext={onNext}
        bottomOffsetClass="bottom-[5vh]"
      />
    </div>
  );
};
