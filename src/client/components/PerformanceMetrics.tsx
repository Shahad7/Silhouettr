import React from 'react';

interface PerformanceMetricsProps {
  attempts: number;
  timeElapsed: number;
  completed: boolean;
  leaderboardPosition?: number;
  className?: string;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  attempts,
  timeElapsed,
  completed,
  leaderboardPosition,
  className = ''
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded p-2 ${className}`}>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-sm font-black text-white">{attempts}</div>
          <div className="text-xs text-gray-400">Attempts</div>
        </div>
        <div>
          <div className="text-sm font-black text-white font-mono">
            {formatTime(timeElapsed)}
          </div>
          <div className="text-xs text-gray-400">Time</div>
        </div>
      </div>
      {completed && leaderboardPosition && (
        <div className="mt-1 text-center">
          <span className="text-xs text-yellow-400 font-bold">
            Rank #{leaderboardPosition}
          </span>
        </div>
      )}
    </div>
  );
};
