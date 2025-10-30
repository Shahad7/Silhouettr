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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 flex items-center justify-center">
      {/* Fixed container that works on both mobile and desktop */}
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 w-full max-w-[360px] shadow-2xl mx-auto">
        {/* Header - Fixed scale */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-white to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4 rotate-3 transform">
            <span className="text-xl filter drop-shadow">◼️</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
            SILHOUETTR
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-gray-600 to-gray-400 mx-auto rounded-full"></div>
          <p className="text-gray-400 text-xs mt-3 font-light tracking-wide">CREATE SYMBOLS • CHALLENGE MINDS</p>
        </div>

        {/* Success Message - Fixed scale */}
        {successMessage && (
          <div className="mb-6 p-3 bg-gray-750/90 border border-gray-600/50 rounded-lg backdrop-blur-sm">
            <p className="text-green-400 text-xs text-center font-medium">{successMessage}</p>
            {onClearSuccess && (
              <button
                onClick={onClearSuccess}
                className="mt-1 text-xs text-gray-400 hover:text-white transition-colors duration-150 block mx-auto font-medium"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Action Buttons - Fixed scale */}
        <div className="space-y-3">
          <button
            onClick={onCreateClick}
            className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl text-sm font-bold hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            <span className="text-base group-hover:scale-110 transition-transform">🖊️</span>
            Create Challenge
          </button>

          {onPlayClick && (
            <button
              onClick={onPlayClick}
              className="w-full bg-gray-700/80 text-white py-3 px-4 rounded-xl text-sm font-bold hover:bg-gray-600/90 active:bg-gray-500/90 transition-all duration-200 border border-gray-600/50 hover:border-gray-500 active:scale-[0.98] flex items-center justify-center gap-2 group backdrop-blur-sm"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🎯</span>
              Play Challenge
            </button>
          )}

          {onLeaderboardClick && (
            <button
              onClick={onLeaderboardClick}
              className="w-full bg-gray-700/80 text-white py-3 px-4 rounded-xl text-sm font-bold hover:bg-gray-600/90 active:bg-gray-500/90 transition-all duration-200 border border-gray-600/50 hover:border-gray-500 active:scale-[0.98] flex items-center justify-center gap-2 group backdrop-blur-sm"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🏆</span>
              Leaderboard
            </button>
          )}
        </div>

        {/* Status - Fixed scale */}
        <div className="text-center mt-6 pt-4 border-t border-gray-700/30">
          <p className="text-gray-500 text-xs font-medium">
            {isInitializing ? '🔄 Scanning...' : 'Ready to create & conquer'}
          </p>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 p-4">
  //     <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full">
  //       <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
  //         🎯 Shape Guess Challenge
  //       </h1>

  //       {/* Success Message */}
  //       {successMessage && (
  //         <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
  //           <p className="text-green-800 text-sm text-center">{successMessage}</p>
  //           {onClearSuccess && (
  //             <button
  //               onClick={onClearSuccess}
  //               className="mt-2 text-xs text-green-600 hover:text-green-800 underline block mx-auto"
  //             >
  //               Dismiss
  //             </button>
  //           )}
  //         </div>
  //       )}

  //       <div className="space-y-4">
  //         <button
  //           onClick={onCreateClick}
  //           className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
  //         >
  //           🎨 Create Challenge
  //         </button>
  //         {onPlayClick && (
  //           <button
  //             onClick={onPlayClick}
  //             className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
  //           >
  //             🎯 Play Challenge
  //           </button>
  //         )}
  //         {onLeaderboardClick && (
  //           <button
  //             onClick={onLeaderboardClick}
  //             className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:shadow-lg transform hover:scale-105 transition"
  //           >
  //             🏆 View Leaderboard
  //           </button>
  //         )}
  //       </div>
  //       <p className="text-center mt-6 text-gray-600">
  //         {isInitializing ? '🔄 Checking for challenges...' : '🎮 Reddit Challenge Mode'}
  //       </p>
  //     </div>
  //   </div>
  // );
};
