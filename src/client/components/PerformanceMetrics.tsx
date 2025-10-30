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
    <div className={`bg-white border border-gray-200 rounded-lg p-3 ${className}`}>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div>
          <div className="text-sm font-black text-gray-900">{attempts}</div>
          <div className="text-xs text-gray-600">Attempts</div>
        </div>
        <div>
          <div className="text-sm font-black text-gray-900 font-mono">
            {formatTime(timeElapsed)}
          </div>
          <div className="text-xs text-gray-600">Time</div>
        </div>
      </div>
      {completed && leaderboardPosition && (
        <div className="mt-2 text-center">
          <span className="text-xs text-blue-600 font-bold">
            Rank #{leaderboardPosition}
          </span>
        </div>
      )}
    </div>
  );
};
