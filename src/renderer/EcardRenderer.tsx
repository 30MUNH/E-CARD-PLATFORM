import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Heart } from 'lucide-react';
import { calculateLoveDays, DEFAULT_ECARD_UUID } from '../data/ecardData';
import { isIOSOrMobileSafari, unlockSafariIOSAudio, useMedia } from '../context/MediaContext';
import { useTapSound } from '../hooks/useTapSound';
import { EcardConfig, PinVerificationResult, SlideId } from '../types/ecard';
import { EcardProvider, useEcard } from './EcardContext';
import { FloatingHeartsOverlay } from './FloatingHeartsOverlay';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { PinScreen } from '../components/PinScreen';
import { SidebarDrawer, SidebarToggleButton } from '../components/Sidebar';
import { HomepageView } from '../components/HomepageView';
import { AlbumView } from '../components/AlbumView';
import { MusicView } from '../components/MusicView';
import { LetterView } from '../components/LetterView';
import { TimelineView } from '../components/TimelineView';
import { GameView } from '../components/GameView';
import { VideoView } from '../components/VideoView';

interface SlideStageContentProps {
  onVerifyRedirectSetting?: (ecardId: string) => void;
}

const SlideStageContent: React.FC<SlideStageContentProps> = ({ onVerifyRedirectSetting }) => {
  const {
    config,
    activeSlideIndex,
    setActiveSlideIndex,
    activeSlides,
    currentSlide,
    navigateToSlide,
    goNextSlide,
    goPrevSlide,
    isPreviewMode,
  } = useEcard();

  const ecardId = config.ecardData.id || DEFAULT_ECARD_UUID;
  const loveStartDate = config.ecardData.love_start_date;
  const [loveDays, setLoveDays] = useState(() => calculateLoveDays(loveStartDate));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const playTapSound = useTapSound();
  const navigate = useNavigate();

  useEffect(() => {
    setLoveDays(calculateLoveDays(loveStartDate));
  }, [loveStartDate]);

  useEffect(() => {
    if (currentSlide.id === 'setting' && ecardId) {
      if (isPreviewMode) return;
      const timer = setTimeout(() => {
        if (onVerifyRedirectSetting) {
          onVerifyRedirectSetting(ecardId);
        } else {
          navigate(`/ecd/custom-edit/${ecardId}`);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentSlide.id, ecardId, isPreviewMode, navigate, onVerifyRedirectSetting]);

  const handleCardChange = (slideId: SlideId) => {
    playTapSound();
    navigateToSlide(slideId);
  };

  const isTopAlignedSlide =
    currentSlide.id === 'album' ||
    currentSlide.id === 'letter' ||
    currentSlide.id === 'timeline';

  const albumImages = config.albumData.map((item) => item.image_url);
  const hasTimeline = Boolean(config.slideVisibility?.timeline);
  const contentSlides = activeSlides.filter((s) => s.id !== 'setting');

  return (
    <div className="flex flex-col h-full min-h-screen relative bg-[#FFE4E4]">
      <FloatingHeartsOverlay
        enabled={config.themeCustomization?.enableFloatingHearts !== false}
        primaryColor={config.themeCustomization?.primaryColor || '#A33149'}
      />

      {isSidebarOpen && (
        <div
          className="absolute inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <SidebarDrawer
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeIndex={activeSlideIndex}
        setActiveIndex={setActiveSlideIndex}
        hasVoice={config.hasVoice}
        hasVideo={config.hasVideo}
        slides={activeSlides}
        onTouchStart={playTapSound}
      />

      <SidebarToggleButton
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onTouchStart={playTapSound}
      />

      {/* Tablet & Desktop Floating Couple Header & Slide Progress Dots */}
      <div className="hidden md:flex items-center justify-between px-16 pt-4 pb-2 z-30 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-rose-100 text-sm font-semibold text-[#A33149]">
          <Heart className="w-4 h-4 fill-[#A33149] text-[#A33149]" />
          <span>
            {config.ecardData.female_name} &amp; {config.ecardData.male_name}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-rose-100">
          {contentSlides.map((slide) => {
            const idx = activeSlides.findIndex((s) => s.id === slide.id);
            const isActive = idx === activeSlideIndex;
            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Chuyển tới mục ${slide.title}`}
                title={slide.title}
                onClick={() => {
                  playTapSound();
                  setActiveSlideIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all ${
                  isActive
                    ? 'w-7 bg-[#A33149]'
                    : 'w-2.5 bg-[#A33149]/30 hover:bg-[#A33149]/60'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div
        key={currentSlide.id}
        className={`flex-grow transition-all duration-500 ${
          isTopAlignedSlide
            ? 'flex flex-col items-start md:items-center pt-[60px] md:pt-6 overflow-hidden'
            : 'flex items-center justify-center'
        } bg-cover bg-center`}
        style={{
          backgroundImage: `url(${currentSlide.backgroundImage || '/template/background-template-2.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onTouchStart={() => playTapSound()}
      >
        {(() => {
          switch (currentSlide.id) {
            case 'homepage':
              return (
                <HomepageView
                  loveDays={loveDays}
                  ecardId={ecardId}
                  handleCardChange={handleCardChange}
                  preloadedData={config}
                  onNext={goNextSlide}
                  hasTimeline={hasTimeline}
                />
              );
            case 'album':
              return (
                <AlbumView
                  images={albumImages}
                  ecardId={ecardId}
                  preloadedData={config}
                  onBack={activeSlideIndex > 0 ? goPrevSlide : () => setActiveSlideIndex(0)}
                  onNext={goNextSlide}
                />
              );
            case 'music':
              return (
                <MusicView
                  ecardId={ecardId}
                  preloadedData={config}
                  onBack={activeSlideIndex > 0 ? goPrevSlide : () => setActiveSlideIndex(0)}
                  onNext={goNextSlide}
                />
              );
            case 'letter':
              return (
                <LetterView
                  ecardId={ecardId}
                  preloadedData={config}
                  onBack={activeSlideIndex > 0 ? goPrevSlide : () => setActiveSlideIndex(0)}
                  onNext={goNextSlide}
                />
              );
            case 'timeline':
              return (
                <TimelineView
                  preloadedData={config}
                  onBack={activeSlideIndex > 0 ? goPrevSlide : () => setActiveSlideIndex(0)}
                  onNext={goNextSlide}
                />
              );
            case 'video':
              return (
                <VideoView
                  ecardId={ecardId}
                  videoUrl={config.videoData?.video_url}
                  onBack={activeSlideIndex > 0 ? goPrevSlide : () => setActiveSlideIndex(0)}
                  onNext={goNextSlide}
                />
              );
            case 'game':
              return (
                <GameView
                  onBack={activeSlideIndex > 0 ? goPrevSlide : () => setActiveSlideIndex(0)}
                  onNext={goNextSlide}
                />
              );
            case 'setting':
              return (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <p className="text-xl text-gray-700 mb-4">
                    {isPreviewMode
                      ? 'Trang Cài đặt (Trong chế độ Xem trước Admin, chuyển hướng được tạm tắt)'
                      : 'Đang chuyển hướng bạn đến trang cài đặt...'}
                  </p>
                  {!isPreviewMode && (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700" />
                  )}
                </div>
              );
            default:
              return (
                <div className="w-full max-w-sm mx-auto text-center text-xl font-medium text-gray-500">
                  Không tìm thấy nội dung
                </div>
              );
          }
        })()}
      </div>
    </div>
  );
};

export interface EcardRendererProps {
  config: EcardConfig;
  initialStep?: 'welcome' | 'pin' | 'main';
  initialSlideId?: SlideId;
  isPreviewMode?: boolean;
  onVerifyPin?: (pin: string) => Promise<PinVerificationResult | boolean>;
  onCardUnlocked?: (unlockedConfig: EcardConfig) => void;
}

export const EcardRenderer: React.FC<EcardRendererProps> = ({
  config,
  initialStep = 'welcome',
  initialSlideId,
  isPreviewMode = false,
  onVerifyPin,
  onCardUnlocked,
}) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'pin' | 'main'>(initialStep);
  const [activeConfig, setActiveConfig] = useState<EcardConfig>(config);
  const playTapSound = useTapSound();
  const { handleUserInteraction } = useMedia();
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setActiveConfig(config);
  }, [config]);

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (currentStep === 'main') {
      setHasInteracted(true);
      if (isIOSOrMobileSafari()) {
        void unlockSafariIOSAudio();
      }
      handleUserInteraction();
    }
  }, [currentStep, handleUserInteraction]);

  const handleStart = () => {
    playTapSound();
    if (activeConfig.ecardData.has_pin) {
      setCurrentStep('pin');
    } else {
      setCurrentStep('main');
    }
  };

  const handlePinSuccess = (result?: PinVerificationResult) => {
    if (result?.cardContent) {
      setActiveConfig(result.cardContent);
      onCardUnlocked?.(result.cardContent);
    }
    setCurrentStep('main');
  };

  const renderStage = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeScreen
            onStart={handleStart}
            onTouchStart={playTapSound}
            welcomeConfig={activeConfig.welcomeConfig}
            coupleNames={{
              femaleName: activeConfig.ecardData.female_name,
              maleName: activeConfig.ecardData.male_name,
            }}
          />
        );
      case 'pin':
        return (
          <PinScreen
            ecardId={activeConfig.ecardData.id || DEFAULT_ECARD_UUID}
            onSuccess={handlePinSuccess}
            onTouchStart={playTapSound}
            onVerifyPin={onVerifyPin}
            pinScreenConfig={activeConfig.pinScreenConfig}
          />
        );
      case 'main':
        return (
          <EcardProvider
            config={activeConfig}
            isPreviewMode={isPreviewMode}
            initialSlideId={initialSlideId}
          >
            <SlideStageContent />
          </EcardProvider>
        );
    }
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col bg-cover bg-center relative overflow-x-hidden"
      style={{
        backgroundImage: `url('/template/background-template.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => {
        if (!hasInteracted) {
          setHasInteracted(true);
          handleUserInteraction();
        }
      }}
    >
      <div className="w-full min-h-screen flex flex-col bg-transparent overflow-x-hidden">
        {renderStage()}
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};
