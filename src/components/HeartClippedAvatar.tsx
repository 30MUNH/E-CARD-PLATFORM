import React from 'react';

interface HeartClippedAvatarProps {
  imageUrl: string;
  size?: number;
  borderColor?: string;
  dashArray?: string;
  rotation?: number;
  borderScale?: number;
}

const HEART_PATH = `
  M1500 750.02375
  C1275.075 487.89625 899.22125 406.8875 617.40375 646.9175
  C335.58625 886.9475 296.0725 1288.2625 517.2225 1572.15
  C701.23 1810.675 1258.1 2305.9875 1440.6125 2467.1125
  C1461.025 2485.1375 1471.2375 2494.15 1483.15 2497.6875
  C1493.5375 2500.775 1505.1625 2500.775 1515.55 2497.6875
  C1527.4625 2494.15 1537.675 2485.1375 1558.0875 2467.1125
  C1740.6 2305.9875 2297.47 1810.675 2481.4775 1572.15
  C2702.6275 1288.2625 2662.4625 849.045 2381.05 646.9175
  C2099.6375 444.79 1724.925 487.89625 1500 750.02375
  Z
`;

export const HeartClippedAvatar: React.FC<HeartClippedAvatarProps> = ({
  imageUrl,
  size = 400,
  borderColor = '#C0302C',
  dashArray = '500,20',
  rotation = -10,
  borderScale = 0.94,
}) => {
  const center = 1500;
  const borderTransform = `
    translate(${center}, ${center})
    scale(${borderScale})
    rotate(${rotation})
    translate(${-center}, ${-center})
  `;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 3000 3000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="heartClip">
          <path d={HEART_PATH} />
        </clipPath>
      </defs>
      <image
        href={imageUrl}
        width="3000"
        height="3000"
        clipPath="url(#heartClip)"
        preserveAspectRatio="xMidYMid slice"
        transform={`translate(0,80) rotate(${rotation}, 1200, ${center})`}
      />
      <path
        d={HEART_PATH}
        transform={borderTransform}
        fill="none"
        stroke={borderColor}
        strokeWidth="20"
        strokeDasharray={dashArray}
      />
    </svg>
  );
};
