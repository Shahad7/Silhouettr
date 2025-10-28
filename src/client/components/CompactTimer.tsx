import React from 'react';

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
