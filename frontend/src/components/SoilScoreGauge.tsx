import React from 'react';

interface SoilScoreGaugeProps {
  score: number; // 0 to 100
  statusText?: string;
  size?: number;
}

export const SoilScoreGauge: React.FC<SoilScoreGaugeProps> = ({ score, statusText, size = 160 }) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = '#2E6F40'; // Crop Leaf Green for high score (Optimal)
  if (normalizedScore < 50) color = '#C86D3B'; // Terracotta Soil for low score
  else if (normalizedScore < 75) color = '#D99B26'; // Harvest Amber Gold for medium score

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E0D8"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-[#2C2825]">{normalizedScore.toFixed(0)}%</span>
          <span className="text-xs font-bold text-[#6C665D] uppercase tracking-wider">Health Index</span>
        </div>
      </div>
      {statusText && (
        <span className="mt-3 px-3 py-1 rounded-full text-xs font-extrabold text-[#1E5128] bg-[#E8F5E9] border border-[#2E6F40]/20">
          {statusText}
        </span>
      )}
    </div>
  );
};
