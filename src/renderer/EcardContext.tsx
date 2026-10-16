import React, { createContext, useContext, useMemo, useState } from 'react';
import { SLIDES } from '../data/ecardData';
import { EcardConfig, SlideDefinition, SlideId } from '../types/ecard';

export interface EcardContextValue {
  config: EcardConfig;
  activeSlideIndex: number;
  setActiveSlideIndex: (index: number) => void;
  activeSlides: SlideDefinition[];
  currentSlide: SlideDefinition;
  navigateToSlide: (slideId: SlideId) => void;
  goNextSlide: () => void;
  goPrevSlide: () => void;
  isPreviewMode: boolean;
}

const EcardContext = createContext<EcardContextValue | undefined>(undefined);

interface EcardProviderProps {
  config: EcardConfig;
  isPreviewMode?: boolean;
  initialSlideId?: SlideId;
  children: React.ReactNode;
}

export function computeActiveSlides(config: EcardConfig): SlideDefinition[] {
  const order: SlideId[] =
    config.slideOrder && config.slideOrder.length > 0
      ? config.slideOrder
      : ['homepage', 'album', 'music', 'letter', 'game', 'video'];

  const visibility = config.slideVisibility || {};

  const orderedDefinitions: SlideDefinition[] = [];
  for (const id of order) {
    const def = SLIDES.find((s) => s.id === id);
    if (!def) continue;

    // Video slide is only included if hasVideo is true AND not explicitly hidden
    if (id === 'video' && (!config.hasVideo || visibility.video === false)) {
      continue;
    }

    // Timeline slide is only included when explicitly enabled in slideVisibility
    if (id === 'timeline' && !visibility.timeline) {
      continue;
    }

    // Check explicit visibility flag (defaults to true for standard slides)
    if (visibility[id] === false) {
      continue;
    }

    orderedDefinitions.push(def);
  }

  return orderedDefinitions.length > 0 ? orderedDefinitions : [SLIDES[0]];
}

export const EcardProvider: React.FC<EcardProviderProps> = ({
  config,
  isPreviewMode = false,
  initialSlideId,
  children,
}) => {
  const activeSlides = useMemo(() => computeActiveSlides(config), [config]);

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(() => {
    if (initialSlideId) {
      const idx = activeSlides.findIndex((s) => s.id === initialSlideId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const safeIndex =
    activeSlideIndex >= 0 && activeSlideIndex < activeSlides.length ? activeSlideIndex : 0;
  const currentSlide = activeSlides[safeIndex] || activeSlides[0];

  const navigateToSlide = (slideId: SlideId) => {
    const idx = activeSlides.findIndex((s) => s.id === slideId);
    if (idx !== -1) {
      setActiveSlideIndex(idx);
    }
  };

  const contentSlidesCount = activeSlides.length;

  const goNextSlide = () => {
    const nextIdx = safeIndex + 1;
    if (nextIdx >= contentSlidesCount) {
      setActiveSlideIndex(0);
    } else {
      setActiveSlideIndex(nextIdx);
    }
  };

  const goPrevSlide = () => {
    if (safeIndex > 0) {
      setActiveSlideIndex(safeIndex - 1);
    }
  };

  return (
    <EcardContext.Provider
      value={{
        config,
        activeSlideIndex: safeIndex,
        setActiveSlideIndex,
        activeSlides,
        currentSlide,
        navigateToSlide,
        goNextSlide,
        goPrevSlide,
        isPreviewMode,
      }}
    >
      {children}
    </EcardContext.Provider>
  );
};

export function useEcard(): EcardContextValue {
  const ctx = useContext(EcardContext);
  if (!ctx) {
    throw new Error('useEcard must be used within an EcardProvider');
  }
  return ctx;
}
