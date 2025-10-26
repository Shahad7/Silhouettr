import React, { useState, useEffect, useRef } from 'react';
import { Challenge, UserSession, GuessSubmissionResponse } from '../../shared/types/api';
import { Timer } from './Timer';
import { AttemptCounter, PerformanceMetrics } from './AttemptCounter';
import { challengeApi, handleApiError, isOnline, addOfflineListener } from '../utils/api';

interface ChallengeViewProps {
  postId: string;
  onBack: () => void;
}

interface ChallengeState {
  challenge: Challenge | null;
  session: UserSession | null;
  loading: boolean;
  error: string | null;
  retryable: boolean;
  guess: string;
  submitting: boolean;
  completed: boolean;
  completionData: GuessSubmissionResponse | null;
  offline: boolean;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({ postId, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<ChallengeState>({
    challenge: null,
    session: null,
    loading: true,
    error: null,
    retryable: false,
    guess: '',
    submitting: false,
    completed: false,
    completionData: null,
    offline: !isOnline(),
  });

  // Load challenge data on mount and setup offline listener
  useEffect(() => {
    loadChallenge();

    // Setup offline/online listener
    const removeOfflineListener = addOfflineListener((online) => {
      setState(prev => ({ ...prev, offline: !online }));

      // Retry loading if we come back online and had an error
      if (online && state.error && state.retryable) {
        loadChallenge();
      }
    });

    return removeOfflineListener;
  }, [postId]);

  // Render shapes when challenge loads
  useEffect(() => {
    if (state.challenge && canvasRef.current) {
      renderShapes();
    }
  }, [state.challenge]);

  const loadChallenge = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, retryable: false }));

      const data = await challengeApi.getChallenge(postId);
      setState(prev => ({
        ...prev,
        challenge: data.challenge,
        session: data.session || null,
        loading: false,
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

  const renderShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas || !state.challenge) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size to match container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Render each shape
    state.challenge.shapes.forEach(shape => {
      const x = (shape.xPercent / 100) * canvas.width;
      const y = (shape.yPercent / 100) * canvas.height;
      const size = (shape.sizePercent / 100) * Math.min(canvas.width, canvas.height);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((shape.rotation * Math.PI) / 180);
      ctx.fillStyle = '#000';
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(shape.shape, 0, 0);
      ctx.restore();
    });
  };

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.session || !state.guess.trim() || state.submitting || state.offline) return;

    try {
      setState(prev => ({ ...prev, submitting: true, error: null, retryable: false }));

      const result = await challengeApi.submitGuess({
        postId,
        guess: state.guess.trim(),
        sessionId: state.session.sessionId,
      });

      if (result.correct) {
        setState(prev => ({
          ...prev,
          completed: true,
          completionData: result,
          submitting: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          guess: '',
          submitting: false,
          session: prev.session ? {
            ...prev.session,
            attempts: result.attempts,
          } : null,
        }));
      }
    } catch (error) {
      const { error: errorMessage, retryable } = handleApiError(error);
      setState(prev => ({
        ...prev,
        submitting: false,
        error: errorMessage,
        retryable,
      }));
    }
  };

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      completed: false,
      completionData: null,
      guess: '',
      error: null,
      retryable: false,
    }));
    loadChallenge();
  };

  // Loading state
  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading challenge...</p>
      </div>
    );
  }

  // Error state
  if (state.error) {
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
                onClick={loadChallenge}
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

  // No challenge found
  if (!state.challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Challenge Found</h2>
          <p className="text-yellow-600 mb-4">This post doesn't have a challenge yet.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Completion state
  if (state.completed && state.completionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">🎉 Congratulations!</h2>
          <p className="text-green-700 mb-2">You solved the challenge!</p>
          <div className="mb-4">
            <PerformanceMetrics
              attempts={state.completionData.attempts}
              timeElapsed={state.completionData.timeElapsed || 0}
              completed={true}
              {...(state.completionData.leaderboardPosition && {
                leaderboardPosition: state.completionData.leaderboardPosition
              })}
            />
            <div className="mt-3 p-3 bg-gray-50 rounded text-center">
              <p className="text-sm text-gray-700">
                <strong>Answer:</strong> {state.challenge.answer}
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Play Again
            </button>
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

  // Main challenge view
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
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-semibold">{state.challenge.postTitle}</h1>
            {state.offline && (
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                Offline
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Timer
              {...(state.session?.startTime && { startTime: state.session.startTime })}
              isRunning={!state.completed && !!state.session && !state.offline}
            />
            <AttemptCounter attempts={state.session?.attempts || 0} />
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
          <canvas
            ref={canvasRef}
            className="w-full h-64 border border-gray-300 rounded"
            style={{ aspectRatio: '16/9' }}
          />
        </div>
      </div>

      {/* Guess Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleGuessSubmit} className="max-w-md mx-auto">
          {state.error && !state.loading && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-center">
              <p className="text-sm text-red-600">{state.error}</p>
              {state.retryable && (
                <button
                  type="button"
                  onClick={() => setState(prev => ({ ...prev, error: null }))}
                  className="text-xs text-red-700 underline mt-1"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={state.guess}
              onChange={(e) => setState(prev => ({ ...prev, guess: e.target.value }))}
              placeholder={state.offline ? "Offline - cannot submit" : "What do you see in the shapes?"}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={state.submitting || state.offline}
            />
            <button
              type="submit"
              disabled={!state.guess.trim() || state.submitting || state.offline}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {state.submitting ? 'Submitting...' : state.offline ? 'Offline' : 'Submit'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {state.offline
              ? "You need an internet connection to submit guesses"
              : "Look at the shapes and guess what they represent!"
            }
          </p>
        </form>
      </div>
    </div>
  );
};
