import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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

  const captions = useMemo(() => {
    return albumImages.map(
      (url, idx) =>
        preloadedData.albumData?.[idx]?.caption ||
        preloadedData.albumData?.find((item) => item.image_url === url)?.caption ||
        'Khoảnh khắc đáng nhớ 💖'
    );
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
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) =>
          prev !== null && prev < albumImages.length - 1 ? prev + 1 : prev
        );
      }
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, albumImages.length]);

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

  // Adaptive layout partitioning based on photo count N
  const renderAdaptivePhotoGrid = () => {
    const N = albumImages.length;
    if (N === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          Chưa có hình ảnh nào trong album
        </div>
      );
    }

    if (N === 1) {
      return (
        <div className="flex flex-col items-center justify-center p-4 w-full max-w-sm mx-auto">
          <div
            onClick={() => setSelectedIndex(0)}
            className="w-full bg-white p-3 rounded-2xl shadow-xl border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <img
              src={resolveImageUrl(albumImages[0])}
              alt="group1-img0"
              className="w-full aspect-[4/5] object-cover rounded-xl"
            />
            {captions[0] && (
              <p className="mt-2.5 text-center text-xs md:text-sm font-medium text-[#8c5261]">
                {captions[0]}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (N === 2) {
      return (
        <div className="grid grid-cols-2 gap-3 md:gap-6 p-4 w-full max-w-md md:max-w-xl mx-auto items-center">
          <div
            onClick={() => setSelectedIndex(0)}
            className="bg-white p-2.5 rounded-xl shadow-lg border border-rose-100 cursor-pointer hover:scale-[1.03] transition-transform -rotate-1"
          >
            <img
              src={resolveImageUrl(albumImages[0])}
              alt="group1-img0"
              className="w-full aspect-square object-cover rounded-lg"
            />
            {captions[0] && (
              <p className="mt-2 text-center text-xs font-medium text-[#8c5261] line-clamp-1">
                {captions[0]}
              </p>
            )}
          </div>
          <div
            onClick={() => setSelectedIndex(1)}
            className="bg-white p-2.5 rounded-xl shadow-lg border border-rose-100 cursor-pointer hover:scale-[1.03] transition-transform rotate-1"
          >
            <img
              src={resolveImageUrl(albumImages[1])}
              alt="group1-img1"
              className="w-full aspect-square object-cover rounded-lg"
            />
            {captions[1] && (
              <p className="mt-2 text-center text-xs font-medium text-[#8c5261] line-clamp-1">
                {captions[1]}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (N === 4) {
      return (
        <div className="grid grid-cols-2 gap-3 md:gap-5 p-3 w-full max-w-md md:max-w-2xl mx-auto">
          {albumImages.map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className="bg-white p-2 rounded-xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <img
                src={resolveImageUrl(imgUrl)}
                alt={`group1-img${idx}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              {captions[idx] && (
                <p className="mt-1.5 text-center text-xs text-[#8c5261] truncate">
                  {captions[idx]}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    // General multi-photo layout: Partition into alternating pattern blocks
    // Pattern 1: 1 large on left (58%) + 2 stacked on right (40%)
    // Pattern 2: 2 stacked on left (40%) + 1 large on right (58%)
    // Remainder of 2: 2 balanced side-by-side
    // Remainder of 1: 1 centered card
    const blocks: React.ReactNode[] = [];
    let i = 0;
    let blockIdx = 0;

    while (i < N) {
      const remaining = N - i;

      // If exactly 4 remaining, output two rows of 2
      if (remaining === 4 && i > 0) {
        const idx0 = i;
        const idx1 = i + 1;
        const idx2 = i + 2;
        const idx3 = i + 3;
        blocks.push(
          <div key={`grid-4-${i}`} className="grid grid-cols-2 gap-2.5 md:gap-4 w-full max-w-2xl lg:max-w-4xl py-1.5">
            {[idx0, idx1, idx2, idx3].map((photoIdx) => (
              <div
                key={photoIdx}
                onClick={() => setSelectedIndex(photoIdx)}
                className="bg-white p-2 rounded-xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <img
                  src={resolveImageUrl(albumImages[photoIdx])}
                  alt={`group${blockIdx + 1}-img${photoIdx}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        );
        i += 4;
        blockIdx++;
        continue;
      }

      // If 3 or more remaining, use alternating 3-photo asymmetrical scrapbooks
      if (remaining >= 3) {
        const photo0 = i;
        const photo1 = i + 1;
        const photo2 = i + 2;
        const isEvenBlock = blockIdx % 2 === 0;

        if (isEvenBlock) {
          // Large on left (58%) + 2 small stacked on right (40%)
          blocks.push(
            <div key={`block-even-${photo0}`} className="flex gap-2 md:gap-4 w-full max-w-2xl lg:max-w-4xl py-1.5">
              <div
                onClick={() => setSelectedIndex(photo0)}
                className="w-[58%] bg-white p-2 md:p-3 rounded-xl md:rounded-2xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <img
                  src={resolveImageUrl(albumImages[photo0])}
                  alt={photo0 === 0 ? 'group1-img0' : `group${blockIdx + 1}-img0`}
                  className="w-full aspect-square object-cover rounded-lg md:rounded-xl"
                  onClick={() => setSelectedIndex(photo0)}
                />
              </div>
              <div className="flex flex-col justify-between w-[40%] gap-2 md:gap-4">
                <div
                  onClick={() => setSelectedIndex(photo1)}
                  className="w-full bg-white p-1.5 md:p-2 rounded-xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <img
                    src={resolveImageUrl(albumImages[photo1])}
                    alt={photo0 === 0 ? 'group1-img1' : `group${blockIdx + 1}-img1`}
                    className="w-full aspect-square object-cover rounded-lg"
                    onClick={() => setSelectedIndex(photo1)}
                  />
                </div>
                <div
                  onClick={() => setSelectedIndex(photo2)}
                  className="w-full bg-white p-1.5 md:p-2 rounded-xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <img
                    src={resolveImageUrl(albumImages[photo2])}
                    alt={photo0 === 0 ? 'group1-img2' : `group${blockIdx + 1}-img2`}
                    className="w-full aspect-square object-cover rounded-lg"
                    onClick={() => setSelectedIndex(photo2)}
                  />
                </div>
              </div>
            </div>
          );
        } else {
          // 2 small stacked on left (40%) + Large on right (58%)
          blocks.push(
            <div key={`block-odd-${photo0}`} className="flex gap-2 md:gap-4 w-full max-w-2xl lg:max-w-4xl py-1.5">
              <div className="flex flex-col justify-between w-[40%] gap-2 md:gap-4">
                <div
                  onClick={() => setSelectedIndex(photo0)}
                  className="w-full bg-white p-1.5 md:p-2 rounded-xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <img
                    src={resolveImageUrl(albumImages[photo0])}
                    alt={`group${blockIdx + 1}-img0`}
                    className="w-full aspect-square object-cover rounded-lg"
                    onClick={() => setSelectedIndex(photo0)}
                  />
                </div>
                <div
                  onClick={() => setSelectedIndex(photo1)}
                  className="w-full bg-white p-1.5 md:p-2 rounded-xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <img
                    src={resolveImageUrl(albumImages[photo1])}
                    alt={`group${blockIdx + 1}-img1`}
                    className="w-full aspect-square object-cover rounded-lg"
                    onClick={() => setSelectedIndex(photo1)}
                  />
                </div>
              </div>
              <div
                onClick={() => setSelectedIndex(photo2)}
                className="w-[58%] bg-white p-2 md:p-3 rounded-xl md:rounded-2xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <img
                  src={resolveImageUrl(albumImages[photo2])}
                  alt={`group${blockIdx + 1}-img2`}
                  className="w-full aspect-square object-cover rounded-lg md:rounded-xl"
                  onClick={() => setSelectedIndex(photo2)}
                />
              </div>
            </div>
          );
        }
        i += 3;
        blockIdx++;
        continue;
      }

      // Remainder 2
      if (remaining === 2) {
        const photo0 = i;
        const photo1 = i + 1;
        blocks.push(
          <div key={`block-rem2-${photo0}`} className="grid grid-cols-2 gap-2.5 md:gap-4 w-full max-w-2xl lg:max-w-4xl py-1.5">
            <div
              onClick={() => setSelectedIndex(photo0)}
              className="bg-white p-2 rounded-xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <img
                src={resolveImageUrl(albumImages[photo0])}
                alt={`group${blockIdx + 1}-img0`}
                className="w-full aspect-square object-cover rounded-lg"
                onClick={() => setSelectedIndex(photo0)}
              />
            </div>
            <div
              onClick={() => setSelectedIndex(photo1)}
              className="bg-white p-2 rounded-xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <img
                src={resolveImageUrl(albumImages[photo1])}
                alt={`group${blockIdx + 1}-img1`}
                className="w-full aspect-square object-cover rounded-lg"
                onClick={() => setSelectedIndex(photo1)}
              />
            </div>
          </div>
        );
        i += 2;
        blockIdx++;
        continue;
      }

      // Remainder 1
      if (remaining === 1) {
        const photo0 = i;
        blocks.push(
          <div key={`block-rem1-${photo0}`} className="flex justify-center w-full max-w-2xl lg:max-w-4xl py-1.5">
            <div
              onClick={() => setSelectedIndex(photo0)}
              className="w-2/3 max-w-xs bg-white p-2.5 rounded-xl shadow-md border border-rose-100 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <img
                src={resolveImageUrl(albumImages[photo0])}
                alt={`group${blockIdx + 1}-img0`}
                className="w-full aspect-square object-cover rounded-lg"
                onClick={() => setSelectedIndex(photo0)}
              />
            </div>
          </div>
        );
        i += 1;
        blockIdx++;
        continue;
      }
    }

    return blocks;
  };

  return (
    <div className="w-full z-0">
      <div className="flex flex-col items-center gap-2 md:gap-4 p-2 md:p-6 max-h-[75vh] md:max-h-[80vh] overflow-y-auto">
        {renderAdaptivePhotoGrid()}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Desktop Lightbox Prev/Next/Close controls */}
          {selectedIndex > 0 && (
            <button
              type="button"
              aria-label="Ảnh trước"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
              }}
              className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center z-[140] transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {selectedIndex < albumImages.length - 1 && (
            <button
              type="button"
              aria-label="Ảnh tiếp theo"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null && prev < albumImages.length - 1 ? prev + 1 : prev
                );
              }}
              className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center z-[140] transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          <button
            type="button"
            aria-label="Đóng"
            onClick={closeModal}
            className="hidden md:flex fixed top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center z-[140] transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className={`bg-white p-2 md:p-4 rounded-md md:rounded-2xl shadow-2xl sm:w-[50%] md:max-w-xl lg:max-w-2xl z-[130] flex flex-col items-center overflow-hidden transition-transform duration-300 ${
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
              className="mt-2 md:mt-3 text-lg md:text-xl text-gray-700 text-center px-3 break-words leading-snug"
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
