import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../../shared/types/api';
import { challengeApi, handleApiError, NetworkError, TimeoutError } from '../utils/api';
import { FullscreenLoader } from './LoadingSpinner';

interface LeaderboardProps {
  postId: string;
  currentUsername?: string;
  onBack: () => void;
  onPlayChallenge?: () => void;
}

interface LeaderboardState {
  leaderboard: LeaderboardEntry[];
  userRank?: number;
  totalPlayers: number;
  loading: boolean;
  error: string | null;
  retryable: boolean;
  offline: boolean;
  lastUpdated: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  postId,
  currentUsername,
  onBack,
  onPlayChallenge
}) => {
  const [state, setState] = useState<LeaderboardState>({
    leaderboard: [],
    totalPlayers: 0,
    loading: true,
    error: null,
    retryable: false,
    offline: false,
    lastUpdated: 0,
  });

  useEffect(() => {
    loadLeaderboard();
  }, [postId]);

  const loadLeaderboard = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, retryable: false, offline: false }));

      const data = await challengeApi.getLeaderboard(postId);
      setState(prev => ({
        ...prev,
        leaderboard: data.leaderboard,
        ...(data.userRank !== undefined && { userRank: data.userRank }),
        totalPlayers: data.totalPlayers,
        loading: false,
        lastUpdated: Date.now(),
        offline: false,
      }));
    } catch (error) {
      const { error: errorMessage, retryable } = handleApiError(error);

      const isNetworkError = error instanceof NetworkError || error instanceof TimeoutError;

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryable,
        offline: isNetworkError,
      }));
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const isCurrentUser = (username: string): boolean => {
    return currentUsername === username;
  };

  return (
    <>
      {/* Loading state */}
      {state.loading && <FullscreenLoader message="Loading leaderboard..." />}

      {/* Error state */}
      {state.error && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              {state.offline ? 'Offline' : 'Error'}
            </h2>
            <p className="text-red-600 mb-4">
              {state.offline
                ? 'You are currently offline. Please check your internet connection.'
                : state.error
              }
            </p>
            <div className="flex gap-2 justify-center">
              {(state.retryable || state.offline) && (
                <button
                  onClick={loadLeaderboard}
                  disabled={state.offline}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {state.offline ? 'Waiting for connection...' : 'Retry'}
                </button>
              )}
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main leaderboard view */}
      {!state.loading && !state.error && (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                ← Back
              </button>
              <div className="text-center flex-1 mx-3">
                <h1 className="text-base font-semibold">Leaderboard</h1>
                <p className="text-xs text-gray-600">
                  {state.totalPlayers} player{state.totalPlayers !== 1 ? 's' : ''}
                </p>
                {state.offline && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded mt-1">
                    Offline
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadLeaderboard}
                  disabled={state.offline}
                  className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400"
                  title="Refresh leaderboard"
                >
                  🔄
                </button>
                {onPlayChallenge && (
                  <button
                    onClick={onPlayChallenge}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  >
                    Play
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Current User Rank (if not in top entries) */}
          {state.userRank && state.userRank > 10 && currentUsername && (
            <div className="bg-blue-50 border-b border-gray-200 p-2">
              <div className="text-sm text-blue-700 font-medium text-center">
                Your rank: #{state.userRank}
              </div>
            </div>
          )}

          {/* Leaderboard Entries */}
          <div className="flex-1 overflow-y-auto">
            {state.leaderboard.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-base mb-1">No completions yet!</p>
                  <p className="text-sm">Be the first to solve this challenge.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {state.leaderboard.map((entry) => (
                  <div
                    key={`${entry.username}-${entry.completedAt}`}
                    className={`p-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${isCurrentUser(entry.username) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${getRankColor(entry.rank)}`}>
                        <span className="mr-1">{getRankEmoji(entry.rank)}</span>
                        {entry.rank}
                      </div>

                      {/* Username */}
                      <div>
                        <div className={`font-medium text-sm ${isCurrentUser(entry.username) ? 'text-blue-700' : 'text-gray-900'}`}>
                          {entry.username}
                          {isCurrentUser(entry.username) && (
                            <span className="ml-1 text-xs text-blue-600">(You)</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(entry.completedAt)}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-gray-900">
                        {formatTime(entry.completionTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.attempts} attempt{entry.attempts !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Updated: {new Date(state.lastUpdated).toLocaleTimeString()}
              </span>
              <span>
                Ranked by time + attempts
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


