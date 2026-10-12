import React from 'react';
import { Heart } from 'lucide-react';

interface FloatingHeartsOverlayProps {
  enabled?: boolean;
  primaryColor?: string;
}

const HEART_PARTICLES = [
  { left: '8%', size: 16, duration: '11s', delay: '0s', opacity: 0.25 },
  { left: '22%', size: 22, duration: '14s', delay: '2.5s', opacity: 0.2 },
  { left: '38%', size: 14, duration: '10s', delay: '4s', opacity: 0.18 },
  { left: '64%', size: 20, duration: '13s', delay: '1.2s', opacity: 0.22 },
  { left: '81%', size: 18, duration: '12s', delay: '3.4s', opacity: 0.2 },
  { left: '92%', size: 15, duration: '15s', delay: '5.1s', opacity: 0.16 },
];

export const FloatingHeartsOverlay: React.FC<FloatingHeartsOverlayProps> = ({
  enabled = true,
  primaryColor = '#A33149',
}) => {
  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-10 hidden md:block motion-reduce:hidden"
    >
      {HEART_PARTICLES.map((p, idx) => (
        <div
          key={idx}
          className="absolute bottom-[-32px] animate-float-heart"
          style={{
            left: p.left,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        >
          <Heart
            style={{ width: p.size, height: p.size, color: primaryColor }}
            fill={primaryColor}
          />
        </div>
      ))}
    </div>
  );
};
