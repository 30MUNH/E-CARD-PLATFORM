import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';

interface MediaContextValue {
  isBackgroundMusicPlaying: boolean;
  toggleBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  resumeBackgroundMusic: () => void;
  unlockAudioContext: () => Promise<boolean>;
  handleUserInteraction: () => void;
  stopAllMedia: () => void;
  setBackgroundMusicVolume: (vol: number) => void;
}

const MediaContext = createContext<MediaContextValue | undefined>(undefined);

export function isIOSOrMobileSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    (ua.includes('safari') && !ua.includes('chrome') && ua.includes('mobile')) ||
    ua.includes('iphone') ||
    ua.includes('ipad') ||
    ua.includes('ipod')
  );
}

let iosAudioUnlocked = false;
export async function unlockSafariIOSAudio(): Promise<void> {
  if (!isIOSOrMobileSafari() || iosAudioUnlocked) return;
  try {
    if (Howler.ctx?.state === 'suspended') {
      await Howler.ctx.resume();
    }
    const unlockSound = new Howl({
      src: ['/sounds/tap.mp3'],
      volume: 0.01,
      html5: true,
      onend: () => {
        iosAudioUnlocked = true;
      },
    });
    unlockSound.play();
    unlockSound.fade(0.1, 0, 50);
    iosAudioUnlocked = true;
  } catch (err) {
    console.error('Error unlocking Safari iOS audio:', err);
  }
}

let globalPlayingFlag = false;

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const howlRef = useRef<Howl | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const playGuardRef = useRef(false);
  const pausedByVisibilityRef = useRef(false);
  const wasPlayingBeforeStopRef = useRef(false);

  const playBackgroundMusic = (): boolean => {
    const sound = howlRef.current;
    if (!sound || sound.playing() || playGuardRef.current) return false;
    try {
      playGuardRef.current = true;
      if (isIOSOrMobileSafari()) {
        sound.load();
        if (!sound.playing()) sound.play();
      } else {
        if (Howler.ctx?.state === 'suspended') {
          Howler.ctx.resume();
        }
        sound.play();
      }
      return true;
    } catch (err) {
      console.error('Error playing background music:', err);
      return false;
    } finally {
      playGuardRef.current = false;
    }
  };

  useEffect(() => {
    if (!howlRef.current) {
      howlRef.current = new Howl({
        src: ['/sounds/soundtrack.mp3'],
        loop: true,
        volume: 0.3,
        autoplay: false,
        html5: isIOSOrMobileSafari(),
        preload: true,
        onplay: () => {
          setIsPlaying(true);
          globalPlayingFlag = true;
        },
        onpause: () => {
          setIsPlaying(false);
          globalPlayingFlag = false;
        },
        onstop: () => {
          setIsPlaying(false);
          globalPlayingFlag = false;
        },
      });
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlaying) {
          pausedByVisibilityRef.current = true;
          howlRef.current?.pause();
        }
      } else if (pausedByVisibilityRef.current) {
        setTimeout(() => {
          playBackgroundMusic();
          pausedByVisibilityRef.current = false;
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (isIOSOrMobileSafari()) {
      howlRef.current.load();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      howlRef.current?.unload();
    };
  }, []);

  const unlockAudioContext = async (): Promise<boolean> => {
    if (isUnlocked) return true;
    try {
      if (Howler.ctx?.state === 'suspended') {
        await Howler.ctx.resume();
      }
      const tap = new Howl({
        src: ['/sounds/tap.mp3'],
        volume: 0.1,
        html5: isIOSOrMobileSafari(),
      });
      tap.play();
      tap.fade(0.1, 0, 50);
      if (howlRef.current) {
        if (isIOSOrMobileSafari()) {
          howlRef.current.load();
        } else {
          howlRef.current.volume(0.001);
          howlRef.current.play();
          howlRef.current.pause();
          howlRef.current.volume(0.3);
        }
      }
      setIsUnlocked(true);
      return true;
    } catch (err) {
      console.error('Failed to unlock audio context:', err);
      return false;
    }
  };

  const toggleBackgroundMusic = () => {
    if (!howlRef.current) return;
    if (isPlaying) {
      howlRef.current.pause();
    } else {
      playBackgroundMusic();
    }
  };

  const pauseBackgroundMusic = () => {
    if (howlRef.current && isPlaying) {
      howlRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeBackgroundMusic = () => {
    if (howlRef.current && !isPlaying) {
      playBackgroundMusic();
    }
  };

  const handleUserInteraction = () => {
    if (!isPlaying && !globalPlayingFlag) {
      playBackgroundMusic();
    }
  };

  const stopAllMedia = () => {
    wasPlayingBeforeStopRef.current = isPlaying;
    if (howlRef.current?.playing()) {
      howlRef.current.pause();
      setIsPlaying(false);
    }
    if (Howler.ctx?.state === 'running') {
      Howler.ctx.suspend();
    }
    window.dispatchEvent(new CustomEvent('stop-letter-audio', { detail: { force: true } }));
    window.dispatchEvent(new CustomEvent('stop-video', { detail: { force: true } }));
    window.dispatchEvent(new CustomEvent('stop-music', { detail: { force: true } }));
    if (isIOSOrMobileSafari()) {
      unlockSafariIOSAudio();
    }
    setTimeout(() => {
      if (wasPlayingBeforeStopRef.current) {
        resumeBackgroundMusic();
        wasPlayingBeforeStopRef.current = false;
      }
    }, 300);
  };

  const setBackgroundMusicVolume = (vol: number) => {
    howlRef.current?.volume(vol);
  };

  return (
    <MediaContext.Provider
      value={{
        isBackgroundMusicPlaying: isPlaying,
        toggleBackgroundMusic,
        pauseBackgroundMusic,
        resumeBackgroundMusic,
        unlockAudioContext,
        handleUserInteraction,
        stopAllMedia,
        setBackgroundMusicVolume,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export function useMedia(): MediaContextValue {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return ctx;
}
