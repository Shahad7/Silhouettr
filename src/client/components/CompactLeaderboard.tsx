import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../../shared/types/api';
import { challengeApi } from '../utils/api';
import { CompactLoader } from './LoadingSpinner';

interface CompactLeaderboardProps {
    postId: string;
    maxEntries?: number;
    currentUsername?: string;
    className?: string;
}

export const CompactLeaderboard: React.FC<CompactLeaderboardProps> = ({
    postId,
    maxEntries = 3,
    currentUsername,
    className = ''
}) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const data = await challengeApi.getLeaderboard(postId);
                setLeaderboard(data.leaderboard.slice(0, maxEntries));
            } catch (error) {
                console.error('Failed to load compact leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, [postId, maxEntries]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`bg-gray-50 rounded p-3 ${className}`}>
            <div className="text-sm font-medium text-gray-700 mb-2">Top Players</div>

            {loading && <CompactLoader />}

            {!loading && leaderboard.length === 0 && (
                <div className="text-xs text-gray-500">No completions yet</div>
            )}

            {!loading && leaderboard.length > 0 && (
                <div className="space-y-1">
                    {leaderboard.map((entry) => (
                        <div
                            key={`${entry.username}-${entry.completedAt}`}
                            className={`flex items-center justify-between p-2 rounded text-xs ${currentUsername === entry.username ? 'bg-blue-100 text-blue-800' : 'bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">#{entry.rank}</span>
                                <span className="font-medium">{entry.username}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-semibold">{formatTime(entry.completionTime)}</div>
                                <div className="text-gray-500">{entry.attempts} tries</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
