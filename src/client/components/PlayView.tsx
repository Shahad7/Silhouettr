import React from 'react';
import { Canvas } from './Canvas';

interface PlayViewProps {
  challenges: Challenge[];
  selectedChallenge: Challenge | null;
  guess: string;
  attempts: number;
  solved: boolean;
  solveTime: number;
  onChallengeSelect: (challengeId: string) => void;
  onGuessChange: (guess: string) => void;
  onSubmitGuess: () => void;
  onBackToMenu: () => void;
  onCreateChallenge: () => void;
  onDeselectChallenge: () => void;
}

export const PlayView: React.FC<PlayViewProps> = ({
  challenges,
  selectedChallenge,
  guess,
  attempts,
  solved,
  solveTime,
  onChallengeSelect,
  onGuessChange,
  onSubmitGuess,
  onBackToMenu,
  onCreateChallenge,
  onDeselectChallenge,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmitGuess();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 to-pink-500 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 max-w-3xl w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
          🎮 Play Challenge
        </h2>

        {/* Challenge Selector */}
        {!selectedChallenge && (
          <>
            {!challenges || challenges.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">No challenges yet!</p>
                <p className="text-gray-500 mb-6">Create one first to start playing.</p>
                <button
                  onClick={onCreateChallenge}
                  className="bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 transition"
                >
                  🎨 Create Challenge
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Select a Challenge:</p>
                {challenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    onClick={() => onChallengeSelect(challenge.id)}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition text-left"
                  >
                    🎯 {challenge.name}{' '}
                    <span className="text-sm opacity-75">
                      ({challenge.shapes?.length || 0} shapes)
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Selected Challenge */}
        {selectedChallenge && !solved && (
          <>
            <div className="mb-4 sm:mb-6">
              <Canvas shapes={selectedChallenge.shapes || []} isPlayMode={true} />
            </div>

            <div className="mb-4 text-center text-gray-600">Attempts: {attempts}</div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Guess:</label>
              <input
                type="text"
                value={guess}
                onChange={(e) => onGuessChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What shape do you see?"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={onSubmitGuess}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition mb-4"
            >
              Submit Guess
            </button>

            <button
              onClick={onDeselectChallenge}
              className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              ← Choose Different Challenge
            </button>
          </>
        )}

        {/* Success State */}
        {solved && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-green-600 mb-4">You solved it!</h3>
            <p className="text-xl text-gray-700 mb-6">
              in <strong>{attempts}</strong> attempt{attempts !== 1 ? 's' : ''} and{' '}
              <strong>{solveTime}</strong> second{solveTime !== 1 ? 's' : ''}!
            </p>
            <button
              onClick={onDeselectChallenge}
              className="bg-blue-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-600 transition mb-3"
            >
              Play Another Challenge
            </button>
          </div>
        )}

        <button
          onClick={onBackToMenu}
          className="w-full mt-4 bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
};
