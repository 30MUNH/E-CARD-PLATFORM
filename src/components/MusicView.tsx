import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { FaBackward, FaForward, FaPause, FaPlay } from 'react-icons/fa';
import { useMedia } from '../context/MediaContext';
import { EcardPreloadData, resolveImageUrl } from '../data/ecardData';
import { FloatingNavButtons } from './FloatingNavButtons';

interface MusicViewProps {
  ecardId: string;
  preloadedData: EcardPreloadData;
  onBack: () => void;
  onNext: () => void;
}

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) && seconds >= 0 ? seconds : 0;
  const mins = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const MusicView: React.FC<MusicViewProps> = ({
  preloadedData,
  onBack,
  onNext,
}) => {
  const { pauseBackgroundMusic, resumeBackgroundMusic, isBackgroundMusicPlaying } = useMedia();
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [pausedBgMusic, setPausedBgMusic] = useState(false);
  const pausedByVisibilityRef = useRef(false);
  const manualPauseRef = useRef(false);

  const musicItem = Array.isArray(preloadedData.musicData)
    ? preloadedData.musicData[0]
    : preloadedData.musicData;

  const effectiveAudioUrl = musicItem?.audio_url || (!musicItem?.youtube_id ? '/sounds/soundtrack.mp3' : undefined);
  const hasCustomAudio = Boolean(effectiveAudioUrl);

  useEffect(() => {
    if (hasCustomAudio) {
      setIsReady(true);
    }
  }, [hasCustomAudio]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlaying) {
          pausedByVisibilityRef.current = true;
          manualPauseRef.current = false;
          if (hasCustomAudio) {
            htmlAudioRef.current?.pause();
          } else {
            player?.pauseVideo();
          }
          setIsPlaying(false);
        }
      } else if (pausedByVisibilityRef.current && !manualPauseRef.current) {
        setTimeout(() => {
          if (hasCustomAudio) {
            void htmlAudioRef.current?.play();
          } else {
            player?.playVideo();
          }
          setIsPlaying(true);
          pausedByVisibilityRef.current = false;
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [player, isPlaying, hasCustomAudio]);

  useEffect(() => {
    return () => {
      if (pausedBgMusic) {
        setTimeout(() => {
          resumeBackgroundMusic();
          setPausedBgMusic(false);
        }, 300);
      }
    };
  }, [pausedBgMusic, resumeBackgroundMusic]);

  useEffect(() => {
    const handleStopMusic = () => {
      if (hasCustomAudio && htmlAudioRef.current) {
        manualPauseRef.current = true;
        htmlAudioRef.current.pause();
        setIsPlaying(false);
      } else if (player) {
        manualPauseRef.current = true;
        player.pauseVideo();
        setIsPlaying(false);
      }
      setTimeout(() => {
        resumeBackgroundMusic();
        setPausedBgMusic(false);
      }, 300);
    };

    window.addEventListener('stop-music', handleStopMusic);
    return () => window.removeEventListener('stop-music', handleStopMusic);
  }, [player, resumeBackgroundMusic, hasCustomAudio]);

  const handleReady = (event: YouTubeEvent) => {
    setPlayer(event.target);
    setIsReady(true);
  };

  const handleStateChange = (event: YouTubeEvent<number>) => {
    if (event.data === 1) {
      if (isBackgroundMusicPlaying) {
        setPausedBgMusic(true);
        pauseBackgroundMusic();
      }
      setIsPlaying(true);
    } else if (event.data === 2) {
      if (pausedBgMusic && !manualPauseRef.current) {
        setTimeout(() => {
          resumeBackgroundMusic();
          setPausedBgMusic(false);
        }, 300);
      }
      setIsPlaying(false);
    } else if (event.data === 0) {
      if (pausedBgMusic) {
        setTimeout(() => {
          resumeBackgroundMusic();
          setPausedBgMusic(false);
        }, 300);
      }
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (hasCustomAudio && htmlAudioRef.current) {
      const audio = htmlAudioRef.current;
      if (!audio.paused) {
        manualPauseRef.current = true;
        audio.pause();
        setIsPlaying(false);
        if (pausedBgMusic) {
          resumeBackgroundMusic();
          setPausedBgMusic(false);
        }
      } else {
        manualPauseRef.current = false;
        if (isBackgroundMusicPlaying) {
          setPausedBgMusic(true);
          pauseBackgroundMusic();
        }
        void audio.play();
        setIsPlaying(true);
      }
      return;
    }

    if (!player) return;
    try {
      if (player.getPlayerState() === 1) {
        manualPauseRef.current = true;
        player.pauseVideo();
        setIsPlaying(false);
        if (pausedBgMusic) {
          setTimeout(() => {
            resumeBackgroundMusic();
            setPausedBgMusic(false);
          }, 300);
        }
      } else {
        manualPauseRef.current = false;
        if (isBackgroundMusicPlaying) {
          setPausedBgMusic(true);
          pauseBackgroundMusic();
        }
        if (navigator.userAgent.toLowerCase().includes('zalo')) {
          player.unMute();
        }
        player.playVideo();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error controlling YouTube player:', err);
    }
  };

  const skipForward = () => {
    if (hasCustomAudio && htmlAudioRef.current) {
      const audio = htmlAudioRef.current;
      audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0);
      setCurrentTime(audio.currentTime);
      return;
    }
    if (!player) return;
    try {
      const cur = player.getCurrentTime();
      const dur = player.getDuration();
      const next = Math.min(cur + 5, dur);
      player.seekTo(next, true);
      setCurrentTime(next);
    } catch (err) {
      console.error('Error skipping forward:', err);
    }
  };

  const skipBackward = () => {
    if (hasCustomAudio && htmlAudioRef.current) {
      const audio = htmlAudioRef.current;
      audio.currentTime = Math.max(audio.currentTime - 5, 0);
      setCurrentTime(audio.currentTime);
      return;
    }
    if (!player) return;
    try {
      const cur = player.getCurrentTime();
      const next = Math.max(cur - 5, 0);
      player.seekTo(next, true);
      setCurrentTime(next);
    } catch (err) {
      console.error('Error skipping backward:', err);
    }
  };

  useEffect(() => {
    if (!player || hasCustomAudio) return;
    const interval = setInterval(() => {
      try {
        const cur = player.getCurrentTime();
        const dur = player.getDuration();
        setCurrentTime(cur || 0);
        setDuration(dur || 0);
      } catch (err) {
        console.error('Error updating progress:', err);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [player, hasCustomAudio]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const artistLabel = musicItem?.artist || 'SONG HÀNH KÝ';
  const quoteLabel = musicItem?.quote || 'Love you to the saturn and back';

  return (
    <div className="p-4 md:p-8 w-full max-w-sm md:max-w-2xl lg:max-w-3xl mx-auto">
      {hasCustomAudio && effectiveAudioUrl ? (
        <audio
          ref={htmlAudioRef}
          src={effectiveAudioUrl}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      ) : (
        <YouTube
          videoId={musicItem.youtube_id}
          onReady={handleReady}
          onStateChange={handleStateChange}
          style={{ height: '1px' }}
          opts={{
            height: '1',
            width: '1',
            playerVars: {
              autoplay: 0,
              playsinline: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              mute: 0,
              origin: typeof window !== 'undefined' ? window.location.origin : undefined,
              start: 1,
            },
          }}
        />
      )}

      <div className="bg-[#8c5261] rounded-xl md:rounded-3xl p-4 md:p-8 relative md:shadow-2xl md:grid md:grid-cols-12 md:gap-8 md:items-center">
        <div className="rounded-xl md:rounded-2xl aspect-square overflow-hidden mb-4 md:mb-0 md:col-span-5 md:shadow-lg">
          <img
            src={resolveImageUrl(musicItem.image_url || '')}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="flex flex-col text-left text-[#c4a5ab]">
            <div className="text-sm md:text-base">{artistLabel}</div>
            <div
              className="text-2xl md:text-3xl lg:text-4xl text-white py-2"
              style={{ fontFamily: "'Dancing Script', 'Pacifico', cursive", fontWeight: '700' }}
            >
              {musicItem.title || ''}
            </div>
            <div className="text-sm md:text-base mb-2">{quoteLabel}</div>
          </div>

          <div className="flex items-center text-sm text-white gap-2 mt-4">
            <span className="min-w-[40px] text-left">{formatTime(currentTime)}</span>
            <div
              className="relative w-full h-2 bg-[#b18392] rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const targetTime = ((e.clientX - rect.left) / rect.width) * duration;
                if (hasCustomAudio && htmlAudioRef.current) {
                  htmlAudioRef.current.currentTime = targetTime;
                  setCurrentTime(targetTime);
                  return;
                }
                if (!player) return;
                try {
                  player.seekTo(targetTime, true);
                  setCurrentTime(targetTime);
                } catch (err) {
                  console.error('Error seeking:', err);
                }
              }}
            >
              <div
                className="absolute top-0 left-0 h-full bg-white"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="min-w-[40px] text-right">{formatTime(duration - currentTime)}</span>
          </div>

          <div className="flex justify-around items-center text-white text-2xl mt-4 md:mt-6">
            <button type="button" onClick={skipBackward}>
              <FaBackward />
            </button>
            <button
              type="button"
              onClick={() => {
                if (isReady) togglePlayPause();
              }}
              disabled={!isReady}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition 
    ${isReady ? 'bg-white text-[#8c4b5d]' : 'bg-gray-300 text-gray-500 animate-pulse'}`}
            >
              {isReady ? (
                isPlaying ? (
                  <FaPause />
                ) : (
                  <FaPlay className="w-5 h-5 relative left-[2px]" />
                )
              ) : (
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
            </button>
            <button type="button" onClick={skipForward}>
              <FaForward />
            </button>
          </div>
        </div>
      </div>

      <FloatingNavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
};
