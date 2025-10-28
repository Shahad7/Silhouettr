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

    const getPerformanceRating = (): { rating: string; color: string; emoji: string } => {
        if (!completed) return { rating: 'In Progress', color: 'text-blue-600', emoji: '⏳' };

        // Simple performance rating based on attempts and time
        const score = attempts * 10 + Math.floor(timeElapsed / 30); // Lower is better

        if (score <= 15) return { rating: 'Excellent', color: 'text-green-600', emoji: '🌟' };
        if (score <= 30) return { rating: 'Good', color: 'text-blue-600', emoji: '👍' };
        if (score <= 50) return { rating: 'Fair', color: 'text-yellow-600', emoji: '👌' };
        return { rating: 'Keep Trying', color: 'text-orange-600', emoji: '💪' };
    };

    const performance = getPerformanceRating();

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Metrics</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{attempts}</div>
                    <div className="text-xs text-gray-500">Attempts</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 font-mono">
                        {formatTime(timeElapsed)}
                    </div>
                    <div className="text-xs text-gray-500">Time</div>
                </div>
            </div>

            {completed && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">{performance.emoji}</span>
                        <span className={`font-semibold ${performance.color}`}>
                            {performance.rating}
                        </span>
                    </div>

                    {leaderboardPosition && (
                        <div className="text-center mt-2">
                            <span className="text-sm text-gray-600">
                                Rank: <span className="font-semibold text-yellow-600">#{leaderboardPosition}</span>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
