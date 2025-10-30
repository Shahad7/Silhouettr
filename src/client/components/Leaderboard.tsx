import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../../shared/types/api';
import { challengeApi, handleApiError, NetworkError, TimeoutError } from '../utils/api';
import { FullscreenLoader } from './LoadingSpinner';

interface LeaderboardProps {
  postId: string;
  currentUsername?: string;
  onBack: () => void;

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
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  postId,
  currentUsername,
  onBack
}) => {
  const [state, setState] = useState<LeaderboardState>({
    leaderboard: [],
    totalPlayers: 0,
    loading: true,
    error: null,
    retryable: false,
    offline: false,
    lastUpdated: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  useEffect(() => {
    loadLeaderboard(1);
  }, [postId]);

  const loadLeaderboard = async (page: number = 1) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, retryable: false, offline: false }));

      // Server-side pagination
      const data = await challengeApi.getLeaderboard(postId, page, state.pageSize);

      setState(prev => ({
        ...prev,
        leaderboard: data.leaderboard,
        ...(data.userRank !== undefined && { userRank: data.userRank }),
        totalPlayers: data.totalPlayers,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        pageSize: data.pageSize,
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

  const handlePreviousPage = () => {
    if (state.currentPage > 1) {
      loadLeaderboard(state.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (state.currentPage < state.totalPages) {
      loadLeaderboard(state.currentPage + 1);
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



  const isCurrentUser = (username: string): boolean => {
    return currentUsername === username;
  };

  return (
    <>
      {/* Loading state */}
      {state.loading && <FullscreenLoader message="Loading leaderboard..." />}

      {/* Error state */}
      {state.error && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 p-6 w-full max-w-[360px] shadow-xl mx-auto text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {state.offline ? 'Offline' : 'Error'}
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {state.offline
                ? 'You are currently offline. Please check your internet connection.'
                : state.error
              }
            </p>
            <div className="flex gap-3 justify-center">
              {(state.retryable || state.offline) && (
                <button
                  onClick={() => loadLeaderboard(1)}
                  disabled={state.offline}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                >
                  {state.offline ? 'Waiting...' : 'Retry'}
                </button>
              )}
              <button
                onClick={onBack}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main leaderboard view */}
      {!state.loading && !state.error && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
          {/* Header - LIGHT THEME */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between max-w-[360px] mx-auto w-full">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors flex items-center gap-1"
              >
                ← Back
              </button>
              <div className="text-center flex-1 mx-3">
                <h1 className="text-base font-bold text-gray-900 mb-1">LEADERBOARD</h1>
                <p className="text-xs text-gray-600">
                  {state.totalPlayers} player{state.totalPlayers !== 1 ? 's' : ''}
                </p>
                {state.offline && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full mt-1 inline-block">
                    Offline
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadLeaderboard(state.currentPage)}
                  disabled={state.offline}
                  className="text-gray-500 hover:text-gray-700 text-sm disabled:text-gray-400 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                  title="Refresh leaderboard"
                >
                  🔄
                </button>
              </div>
            </div>
          </div>

          {/* Current User Rank (if not in top entries) */}
          {state.userRank && state.userRank > 10 && currentUsername && (
            <div className="bg-blue-50 border-b border-gray-200 p-3">
              <div className="max-w-[360px] mx-auto w-full">
                <div className="text-sm text-blue-700 font-medium text-center flex items-center justify-center gap-2">
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
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <p className="text-base font-medium mb-1 text-gray-700">No completions yet!</p>
                    <p className="text-sm text-gray-600">Be the first to solve this challenge.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {state.leaderboard.map((entry) => (
                    <div
                      key={`${entry.username}-${entry.completedAt}`}
                      className={`p-4 rounded-xl border transition-all duration-200 ${isCurrentUser(entry.username)
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Rank */}
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                            entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                              entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                            {entry.rank}
                          </div>

                          {/* Username */}
                          <div>
                            <div className={`font-medium text-sm ${isCurrentUser(entry.username) ? 'text-blue-700' : 'text-gray-900'
                              }`}>
                              {entry.username}
                              {isCurrentUser(entry.username) && (
                                <span className="ml-2 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(entry.completedAt)}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className="font-mono text-sm font-bold text-gray-900">
                            {formatTime(entry.completionTime)}
                          </div>
                          <div className="text-xs text-gray-600">
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

          {/* PAGINATION BUTTONS */}
          {state.totalPages > 1 && (
            <div className="bg-white border-t border-gray-200 p-3">
              <div className="max-w-[360px] mx-auto w-full">
                <div className="flex justify-between items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={state.currentPage <= 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium border border-gray-300 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    ← Previous
                  </button>

                  {/* Page Info */}
                  <div className="text-xs text-gray-600 text-center">
                    Page {state.currentPage} of {state.totalPages}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={state.currentPage >= state.totalPages}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium border border-gray-300 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-white border-t border-gray-200 p-3">
            <div className="max-w-[360px] mx-auto w-full">
              <div className="flex items-center justify-between text-xs text-gray-500">
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


