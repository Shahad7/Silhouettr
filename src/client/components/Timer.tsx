import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  startTime?: number;
  isRunning: boolean;
  onTimeUpdate?: (elapsedSeconds: number) => void;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ 
  startTime, 
  isRunning, 
  onTimeUpdate, 
  className = '' 
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && startTime) {
      // Calculate initial elapsed time
      const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(initialElapsed);

      // Start interval to update timer
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
        onTimeUpdate?.(elapsed);
      }, 1000);
    } else {
      // Clear interval when not running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime, onTimeUpdate]);

  // Reset timer when startTime changes
  useEffect(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
    } else {
      setElapsedTime(0);
    }
  }, [startTime]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-gray-500">⏱️</span>
        <span className="font-mono text-lg font-semibold">
          {formatTime(elapsedTime)}
        </span>
      </div>
      {isRunning && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

interface CompactTimerProps {
  elapsedSeconds: number;
  className?: string;
}

export const CompactTimer: React.FC<CompactTimerProps> = ({ 
  elapsedSeconds, 
  className = '' 
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <span className={`font-mono text-sm ${className}`}>
      {formatTime(elapsedSeconds)}
    </span>
  );
};
