import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../../shared/types/api';
import { challengeApi, handleApiError, isOnline, addOfflineListener } from '../utils/api';

interface LeaderboardProps {
  postId: string;
  currentUsername?: string;
  onBack?: () => void;
  onPlayChallenge?: () => void;
  onClose?: () => void;
  className?: string;
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
  onPlayChallenge,
  onClose,
  className = '' 
}) => {
  const [state, setState] = useState<LeaderboardState>({
    leaderboard: [],
    totalPlayers: 0,
    loading: true,
    error: null,
    retryable: false,
    offline: !isOnline(),
    lastUpdated: 0,
  });

  useEffect(() => {
    loadLeaderboard();
    
    // Setup offline/online listener
    const removeOfflineListener = addOfflineListener((online) => {
      setState(prev => ({ ...prev, offline: !online }));
      
      // Retry loading if we come back online and had an error
      if (online && state.error && state.retryable) {
        loadLeaderboard();
      }
    });
    
    return removeOfflineListener;
  }, [postId]);

  const loadLeaderboard = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, retryable: false }));
      
      const data = await challengeApi.getLeaderboard(postId);
      setState(prev => ({
        ...prev,
        leaderboard: data.leaderboard,
        ...(data.userRank !== undefined && { userRank: data.userRank }),
        totalPlayers: data.totalPlayers,
        loading: false,
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      const { error: errorMessage, retryable } = handleApiError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryable,
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
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? `${diffMinutes}m ago` : 'Just now';
    }
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

  // Full-screen loading state
  if (state.loading && onBack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  // Compact loading state
  if (state.loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Leaderboard</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  // Full-screen error state
  if (state.error && onBack) {
    return (
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
    );
  }

  // Compact error state
  if (state.error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Leaderboard</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            {state.offline ? 'Offline - cannot load leaderboard' : state.error}
          </p>
          {(state.retryable || state.offline) && (
            <button
              onClick={loadLeaderboard}
              disabled={state.offline}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {state.offline ? 'Waiting for connection...' : 'Retry'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full-screen leaderboard view
  if (onBack) {
    return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold">Leaderboard</h1>
              {state.offline && (
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
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
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Play
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <div className="max-w-2xl mx-auto p-4 h-full">
            <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
              {/* Stats Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{state.totalPlayers}</p>
                  <p className="text-sm text-gray-600">
                    Player{state.totalPlayers !== 1 ? 's' : ''} Completed
                  </p>
                  {state.userRank && (
                    <p className="text-sm text-blue-600 mt-1">
                      Your rank: #{state.userRank}
                    </p>
                  )}
                </div>
              </div>

              {/* Leaderboard List */}
              <div className="flex-1 overflow-y-auto">
                {state.leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No completions yet!</p>
                    <p className="text-sm">Be the first to solve this challenge.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {state.leaderboard.map((entry) => (
                      <div
                        key={`${entry.username}-${entry.completedAt}`}
                        className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                          isCurrentUser(entry.username) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${getRankColor(entry.rank)}`}>
                            <span className="mr-1">{getRankEmoji(entry.rank)}</span>
                            {entry.rank}
                          </div>
                          
                          {/* Username */}
                          <div>
                            <div className={`font-medium text-lg ${isCurrentUser(entry.username) ? 'text-blue-700' : 'text-gray-900'}`}>
                              {entry.username}
                              {isCurrentUser(entry.username) && (
                                <span className="ml-2 text-sm text-blue-600">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(entry.completedAt)}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className="font-mono text-lg font-semibold text-gray-900">
                            {formatTime(entry.completionTime)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {entry.attempts} attempt{entry.attempts !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Last updated: {new Date(state.lastUpdated).toLocaleTimeString()}
                  </span>
                  <span>
                    Ranked by time + attempts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact leaderboard view
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold">Leaderboard</h2>
          <p className="text-sm text-gray-600">
            {state.totalPlayers} player{state.totalPlayers !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadLeaderboard}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Refresh leaderboard"
          >
            🔄
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Current User Rank (if not in top entries) */}
      {state.userRank && state.userRank > 10 && currentUsername && (
        <div className="p-3 bg-blue-50 border-b border-gray-200">
          <div className="text-sm text-blue-700 font-medium">
            Your rank: #{state.userRank}
          </div>
        </div>
      )}

      {/* Leaderboard Entries */}
      <div className="max-h-96 overflow-y-auto">
        {state.leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No completions yet!</p>
            <p className="text-sm">Be the first to solve this challenge.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {state.leaderboard.map((entry) => (
              <div
                key={`${entry.username}-${entry.completedAt}`}
                className={`p-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  isCurrentUser(entry.username) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${getRankColor(entry.rank)}`}>
                    <span className="mr-1">{getRankEmoji(entry.rank)}</span>
                    {entry.rank}
                  </div>
                  
                  {/* Username */}
                  <div>
                    <div className={`font-medium ${isCurrentUser(entry.username) ? 'text-blue-700' : 'text-gray-900'}`}>
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
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Last updated: {new Date(state.lastUpdated).toLocaleTimeString()}
          </span>
          <span>
            Ranked by time + attempts
          </span>
        </div>
      </div>
    </div>
  );
};

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

  if (loading) {
    return (
      <div className={`bg-gray-50 rounded p-3 ${className}`}>
        <div className="text-sm font-medium text-gray-700 mb-2">Top Players</div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className={`bg-gray-50 rounded p-3 ${className}`}>
        <div className="text-sm font-medium text-gray-700 mb-2">Top Players</div>
        <div className="text-xs text-gray-500">No completions yet</div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded p-3 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2">Top Players</div>
      <div className="space-y-1">
        {leaderboard.map((entry, index) => (
          <div
            key={`${entry.username}-${entry.completedAt}`}
            className="flex items-center justify-between text-xs"
          >
            <span className={`${currentUsername === entry.username ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
              {index + 1}. {entry.username}
            </span>
            <span className="font-mono text-gray-500">
              {formatTime(entry.completionTime)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
