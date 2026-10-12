import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  calculateLoveDays,
  DEFAULT_ECARD_UUID,
  EcardPreloadData,
  PRELOADED_ECARD_DATA,
  SlideDefinition,
  SLIDES,
} from './data/ecardData';
import { isIOSOrMobileSafari, MediaProvider, unlockSafariIOSAudio, useMedia } from './context/MediaContext';
import { useTapSound } from './hooks/useTapSound';
import { PhoneFrame } from './components/PhoneFrame';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PinScreen } from './components/PinScreen';
import { SidebarDrawer, SidebarToggleButton } from './components/Sidebar';
import { HomepageView } from './components/HomepageView';
import { AlbumView } from './components/AlbumView';
import { MusicView } from './components/MusicView';
import { LetterView } from './components/LetterView';
import { GameView } from './components/GameView';
import { VideoView } from './components/VideoView';
import { CustomEditRedirectPage, SignInPage } from './components/SignInPage';
import { ZaloBrowserModal } from './components/ZaloBrowserModal';

interface SlideContentAreaProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  ecardId: string;
  albumImages: string[];
  loveStartDate: string;
  hasVoice: boolean;
  preloadedData: EcardPreloadData;
}

const SlideContentArea: React.FC<SlideContentAreaProps> = ({
  activeIndex,
  setActiveIndex,
  ecardId,
  albumImages,
  loveStartDate,
  preloadedData,
}) => {
  const currentSlide = SLIDES[activeIndex];
  const [loveDays, setLoveDays] = useState(() => calculateLoveDays(loveStartDate));
  const playTapSound = useTapSound();
  const navigate = useNavigate();

  useEffect(() => {
    setLoveDays(calculateLoveDays(loveStartDate));
  }, [loveStartDate]);

  useEffect(() => {
    if (currentSlide.id === 'setting' && ecardId) {
      const timer = setTimeout(() => {
        navigate(`/ecd/custom-edit/${ecardId}`);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentSlide.id, ecardId, navigate]);

  const handleCardChange = (slideId: SlideDefinition['id']) => {
    const idx = SLIDES.findIndex((s) => s.id === slideId);
    if (idx !== -1) {
      playTapSound();
      setActiveIndex(idx);
    }
  };

  const isTopAlignedSlide =
    currentSlide.id === 'album' || currentSlide.id === 'letter';

  return (
    <div
      key={currentSlide.id}
      className={`flex-grow transition-all duration-500 ${
        isTopAlignedSlide
          ? 'flex flex-col items-start pt-[60px] overflow-hidden'
          : 'flex items-center justify-center'
      } bg-cover bg-center`}
      style={{
        backgroundImage: `url(${currentSlide.backgroundImage})`,
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
                preloadedData={preloadedData}
                onNext={() => setActiveIndex(activeIndex + 1)}
              />
            );
          case 'album':
            return (
              <AlbumView
                images={albumImages}
                ecardId={ecardId}
                preloadedData={preloadedData}
                onBack={() => setActiveIndex(activeIndex - 1)}
                onNext={() => setActiveIndex(activeIndex + 1)}
              />
            );
          case 'music':
            return (
              <MusicView
                ecardId={ecardId}
                preloadedData={preloadedData}
                onBack={() => setActiveIndex(activeIndex - 1)}
                onNext={() => setActiveIndex(activeIndex + 1)}
              />
            );
          case 'letter':
            return (
              <LetterView
                ecardId={ecardId}
                preloadedData={preloadedData}
                onBack={() => setActiveIndex(activeIndex - 1)}
                onNext={() => setActiveIndex(activeIndex + 1)}
              />
            );
          case 'video':
            return (
              <VideoView
                ecardId={ecardId}
                videoUrl={preloadedData.videoData?.video_url}
                onBack={() => setActiveIndex(activeIndex - 1)}
                onNext={() => setActiveIndex(0)}
              />
            );
          case 'game':
            return (
              <GameView
                onBack={() => setActiveIndex(activeIndex - 1)}
                onNext={() =>
                  preloadedData.hasVideo
                    ? setActiveIndex(activeIndex + 1)
                    : setActiveIndex(0)
                }
              />
            );
          case 'setting':
            return (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-xl text-gray-700 mb-4">
                  Đang chuyển hướng bạn đến trang cài đặt...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700" />
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
  );
};

interface MainCarouselStageProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  ecardId: string;
  albumImages: string[];
  loveStartDate: string;
  hasVoice: boolean;
  preloadedData: EcardPreloadData;
  hasVideo: boolean;
}

const MainCarouselStage: React.FC<MainCarouselStageProps> = ({
  activeIndex,
  setActiveIndex,
  ecardId,
  albumImages,
  loveStartDate,
  hasVoice,
  preloadedData,
  hasVideo,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const playTapSound = useTapSound();

  return (
    <div className="flex flex-col h-full relative bg-[#FFE4E4]">
      {isSidebarOpen && (
        <div
          className="absolute inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        hasVoice={hasVoice}
        hasVideo={hasVideo}
        onTouchStart={playTapSound}
      />
      <SidebarToggleButton toggleSidebar={toggleSidebar} onTouchStart={playTapSound} />
      <SlideContentArea
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        ecardId={ecardId}
        albumImages={albumImages}
        loveStartDate={loveStartDate}
        hasVoice={hasVoice}
        preloadedData={preloadedData}
      />
    </div>
  );
};

const CustomEcardCarouselWithGame: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'pin' | 'main'>('welcome');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const [preloadedData] = useState<EcardPreloadData | null>(PRELOADED_ECARD_DATA);
  const [isLoading] = useState(false);
  const playTapSound = useTapSound();
  const { handleUserInteraction } = useMedia();
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentStep === 'main') {
      setHasInteracted(true);
      if (isIOSOrMobileSafari()) {
        unlockSafariIOSAudio();
      }
      handleUserInteraction();
    }
  }, [currentStep, handleUserInteraction]);

  const handleStart = () => {
    playTapSound();
    if (preloadedData?.ecardData?.has_pin) {
      setCurrentStep('pin');
    } else {
      setCurrentStep('main');
    }
  };

  const renderStage = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A33149]" />
        </div>
      );
    }
    if (!preloadedData) {
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          Không thể tải dữ liệu thiệp.
        </div>
      );
    }

    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} onTouchStart={playTapSound} />;
      case 'pin':
        return (
          <>
            <Toaster position="top-center" reverseOrder={false} />
            <PinScreen
              ecardId={preloadedData.ecardData.id || uuid || DEFAULT_ECARD_UUID}
              onSuccess={() => setCurrentStep('main')}
              onTouchStart={playTapSound}
            />
          </>
        );
      case 'main':
        return (
          <MainCarouselStage
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            ecardId={preloadedData.ecardData.id}
            albumImages={preloadedData.albumData.map((item) => item.image_url)}
            loveStartDate={preloadedData.ecardData.love_start_date}
            hasVoice={preloadedData.hasVoice}
            preloadedData={preloadedData}
            hasVideo={preloadedData.hasVideo}
          />
        );
    }
  };

  const outerBackgroundImage =
    (currentStep === 'main' && SLIDES[activeIndex]?.backgroundImage) ||
    '/template/background-template.jpg';

  return (
    <>
      <ZaloBrowserModal />
      <div
        className="min-h-screen flex flex-col items-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${outerBackgroundImage})`,
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
        {isMobile ? (
          <div className="w-full h-screen flex flex-col bg-transparent overflow-hidden fixed top-0 left-0">
            {renderStage()}
          </div>
        ) : (
          <>
            <Toaster position="top-center" reverseOrder={false} />
            <PhoneFrame>{renderStage()}</PhoneFrame>
          </>
        )}
      </div>
      <Toaster position="top-center" />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <MediaProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={`/ecd/game/${DEFAULT_ECARD_UUID}`} replace />}
          />
          <Route path="/ecd/game/:uuid" element={<CustomEcardCarouselWithGame />} />
          <Route path="/ecd/custom-edit/:uuid" element={<CustomEditRedirectPage />} />
          <Route path="/ecd/signin/:uuid" element={<SignInPage />} />
          <Route
            path="*"
            element={<Navigate to={`/ecd/game/${DEFAULT_ECARD_UUID}`} replace />}
          />
        </Routes>
      </BrowserRouter>
    </MediaProvider>
  );
};

export default App;
