import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { isIOSOrMobileSafari, unlockSafariIOSAudio } from '../context/MediaContext';

export function useTapSound(): () => void {
  const howlRef = useRef<Howl | null>(null);
  const loadedRef = useRef(false);
  const playingRef = useRef(false);
  const lastPlayTimeRef = useRef(0);

  useEffect(() => {
    howlRef.current = new Howl({
      src: ['/sounds/tap.mp3'],
      volume: 0.5,
      preload: true,
      html5: isIOSOrMobileSafari(),
      onload: () => {
        loadedRef.current = true;
      },
      onend: () => {
        playingRef.current = false;
      },
      onloaderror: (_id, err) => {
        console.error('Error loading tap sound:', err);
      },
    });

    if (isIOSOrMobileSafari() && !loadedRef.current) {
      unlockSafariIOSAudio();
      howlRef.current.once('load', () => {
        loadedRef.current = true;
      });
      howlRef.current.load();
    }

    return () => {
      howlRef.current?.unload();
    };
  }, []);

  return () => {
    if (!howlRef.current) return;
    try {
      const now = Date.now();
      if (now - lastPlayTimeRef.current < 300 || playingRef.current) return;
      lastPlayTimeRef.current = now;
      playingRef.current = true;

      if (isIOSOrMobileSafari()) {
        unlockSafariIOSAudio();
        if (!loadedRef.current) {
          howlRef.current.load();
          loadedRef.current = true;
        }
        howlRef.current.stop();
        if (!howlRef.current.play()) {
          playingRef.current = false;
        }
      } else {
        if (typeof howlRef.current.playing === 'function' && howlRef.current.playing()) {
          playingRef.current = false;
          return;
        }
        howlRef.current.play();
      }
    } catch (err) {
      playingRef.current = false;
      console.error('Error playing tap sound:', err);
    }
  };
}
