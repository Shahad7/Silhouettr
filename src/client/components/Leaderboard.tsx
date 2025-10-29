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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 flex items-center justify-center">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 w-full max-w-[360px] shadow-2xl mx-auto text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              {state.offline ? 'Offline' : 'Error'}
            </h2>
            <p className="text-gray-300 text-sm mb-6">
              {state.offline
                ? 'You are currently offline. Please check your internet connection.'
                : state.error
              }
            </p>
            <div className="flex gap-3 justify-center">
              {(state.retryable || state.offline) && (
                <button
                  onClick={loadLeaderboard}
                  disabled={state.offline}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                >
                  {state.offline ? 'Waiting...' : 'Retry'}
                </button>
              )}
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm font-medium border border-gray-600"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main leaderboard view */}
      {!state.loading && !state.error && (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between max-w-[360px] mx-auto w-full">
              <button
                onClick={onBack}
                className="text-gray-300 hover:text-white font-medium text-sm transition-colors flex items-center gap-1"
              >
                ← Back
              </button>
              <div className="text-center flex-1 mx-3">
                <h1 className="text-lg font-bold text-white">LEADERBOARD</h1>
                <p className="text-xs text-gray-400 mt-1">
                  {state.totalPlayers} player{state.totalPlayers !== 1 ? 's' : ''}
                </p>
                {state.offline && (
                  <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full mt-1 inline-block">
                    Offline
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadLeaderboard}
                  disabled={state.offline}
                  className="text-gray-400 hover:text-white text-sm disabled:text-gray-600 transition-colors p-2 hover:bg-gray-700 rounded-lg"
                  title="Refresh leaderboard"
                >
                  🔄
                </button>
                {onPlayChallenge && (
                  <button
                    onClick={onPlayChallenge}
                    className="px-3 py-1 bg-white text-gray-900 text-sm rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
                  >
                    Play
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Current User Rank (if not in top entries) */}
          {state.userRank && state.userRank > 10 && currentUsername && (
            <div className="bg-blue-500/10 border-b border-gray-700 p-3">
              <div className="max-w-[360px] mx-auto w-full">
                <div className="text-sm text-blue-400 font-medium text-center flex items-center justify-center gap-2">
                  <span>🎯</span>
                  Your rank: #{state.userRank}
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Entries */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[360px] mx-auto w-full p-4">
              {state.leaderboard.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <p className="text-base font-medium mb-1">No completions yet!</p>
                    <p className="text-sm">Be the first to solve this challenge.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {state.leaderboard.map((entry) => (
                    <div
                      key={`${entry.username}-${entry.completedAt}`}
                      className={`p-4 rounded-xl border transition-all duration-200 ${isCurrentUser(entry.username)
                          ? 'bg-blue-500/10 border-blue-500/30 shadow-lg'
                          : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Rank */}
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                              entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                                entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-gray-700 text-gray-400'
                            }`}>
                            {entry.rank}
                          </div>

                          {/* Username */}
                          <div>
                            <div className={`font-medium text-sm ${isCurrentUser(entry.username) ? 'text-blue-400' : 'text-white'
                              }`}>
                              {entry.username}
                              {isCurrentUser(entry.username) && (
                                <span className="ml-2 text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDate(entry.completedAt)}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className="font-mono text-sm font-bold text-white">
                            {formatTime(entry.completionTime)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {entry.attempts} attempt{entry.attempts !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-800 border-t border-gray-700 p-3">
            <div className="max-w-[360px] mx-auto w-full">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Updated: {new Date(state.lastUpdated).toLocaleTimeString()}</span>
                <span>Ranked by time + attempts</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


