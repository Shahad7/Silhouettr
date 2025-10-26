import React from 'react';

interface MenuViewProps {
  onCreateClick: () => void;
  onPlayClick?: () => void;
  onLeaderboardClick?: () => void;
  isInitializing?: boolean;
  successMessage?: string;
  onClearSuccess?: () => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  onCreateClick,
  onPlayClick,
  onLeaderboardClick,
  isInitializing = false,
  successMessage,
  onClearSuccess
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🎯 Shape Guess Challenge
        </h1>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm text-center">{successMessage}</p>
            {onClearSuccess && (
              <button
                onClick={onClearSuccess}
                className="mt-2 text-xs text-green-600 hover:text-green-800 underline block mx-auto"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={onCreateClick}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
          >
            🎨 Create Challenge
          </button>
          {onPlayClick && (
            <button
              onClick={onPlayClick}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
            >
              🎯 Play Challenge
            </button>
          )}
          {onLeaderboardClick && (
            <button
              onClick={onLeaderboardClick}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
            >
              🏆 View Leaderboard
            </button>
          )}
        </div>
        <p className="text-center mt-6 text-gray-600">
          {isInitializing ? '🔄 Checking for challenges...' : '🎮 Reddit Challenge Mode'}
        </p>
      </div>
    </div>
  );
};
