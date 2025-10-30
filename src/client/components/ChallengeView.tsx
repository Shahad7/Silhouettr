import React, { useState, useEffect } from 'react';
import { Challenge, UserSession, GuessSubmissionResponse } from '../../shared/types/api';
import { Timer } from './Timer';
import { AttemptCounter } from './AttemptCounter';
import { PerformanceMetrics } from './PerformanceMetrics';
import { challengeApi, handleApiError, NetworkError, TimeoutError } from '../utils/api';
import { Canvas } from './Canvas';
import { FullscreenLoader } from './LoadingSpinner';

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
  inlineError: string | null; // For wrong guesses and minor errors
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({ postId, onBack }) => {
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
    offline: false, // Start assuming online, detect through API errors
    inlineError: null,
  });

  // Load challenge data on mount
  useEffect(() => {
    loadChallenge();
  }, [postId]);

  // No need for renderShapes - using Canvas component

  const loadChallenge = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, retryable: false, offline: false, inlineError: null }));

      const data = await challengeApi.getChallenge(postId);

      // Check if user already completed this challenge
      const alreadyCompleted = data.session?.completed === true;



      setState(prev => ({
        ...prev,
        challenge: data.challenge,
        session: data.session || null,
        loading: false,
        offline: false, // Successfully loaded, we're online
        inlineError: alreadyCompleted ? 'You already submitted' : null,
      }));
    } catch (error) {
      const { error: errorMessage, retryable } = handleApiError(error);

      // Detect if this is a network error (likely offline)
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

  // Removed renderShapes - now using Canvas component for consistent rendering

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.session || !state.guess.trim() || state.submitting || state.offline) return;

    try {
      setState(prev => ({ ...prev, submitting: true, inlineError: null, retryable: false }));

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
        // Wrong guess - use inline error to stay in challenge view
        setState(prev => ({
          ...prev,
          guess: '',
          submitting: false,
          inlineError: result.message || 'Incorrect guess. Try again!',
          session: prev.session ? {
            ...prev.session,
            attempts: result.attempts,
          } : null,
        }));
      }
    } catch (error) {
      const { error: errorMessage, retryable } = handleApiError(error);

      // Detect if this is a network error (likely offline)
      const isNetworkError = error instanceof NetworkError || error instanceof TimeoutError;

      // Check if error indicates already completed challenge
      const isAlreadyCompleted = errorMessage.toLowerCase().includes('already') ||
        errorMessage.toLowerCase().includes('completed') ||
        errorMessage.toLowerCase().includes('submitted');

      if (isAlreadyCompleted) {
        // Already completed - show as inline error to stay in challenge view
        setState(prev => ({
          ...prev,
          submitting: false,
          inlineError: 'You already submitted',
          offline: isNetworkError,
        }));
      } else {
        // Serious error - show full screen error
        setState(prev => ({
          ...prev,
          submitting: false,
          error: errorMessage,
          retryable,
          offline: isNetworkError,
        }));
      }
    }
  };



  return (
    <>
      {/* Loading state */}
      {state.loading && <FullscreenLoader message="Loading..." />}

      {/* Error state */}
      {state.error && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 p-4 w-full max-w-[360px] shadow-xl mx-auto text-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">⚠️</span>
            </div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">
              {state.offline ? 'Offline' : 'Error'}
            </h2>
            <p className="text-gray-600 text-xs mb-4">
              {state.offline ? 'No connection' : state.error}
            </p>
            <div className="flex gap-2 justify-center">
              {(state.retryable || state.offline) && (
                <button
                  onClick={loadChallenge}
                  disabled={state.offline}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              )}
              <button
                onClick={onBack}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                ← Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No challenge found */}
      {!state.loading && !state.error && !state.challenge && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 p-4 w-full max-w-[360px] shadow-xl mx-auto text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🔍</span>
            </div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">No Challenge</h2>
            <button
              onClick={onBack}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors mt-2"
            >
              ← Menu
            </button>
          </div>
        </div>
      )}

      {/* Completion state */}
      {!state.loading && !state.error && state.challenge && state.completed && state.completionData && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
          <div className="bg-white backdrop-blur-lg rounded-2xl border border-gray-200 p-4 w-full max-w-[360px] shadow-xl mx-auto text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎉</span>
            </div>
            <h2 className="text-base font-black text-gray-900 mb-2">SOLVED!</h2>

            <div className="mb-4">
              <PerformanceMetrics
                attempts={state.completionData.attempts}
                timeElapsed={state.completionData.timeElapsed || 0}
                completed={true}
                {...(state.completionData.leaderboardPosition && {
                  leaderboardPosition: state.completionData.leaderboardPosition
                })}
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={onBack}
                className="px-6 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                ← Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main challenge view - LIGHT THEME */}
      {!state.loading && !state.error && state.challenge && !state.completed && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
          {/* Header - LIGHT THEME */}
          <div className="bg-white border-b border-gray-200 p-2">
            <div className="flex items-center justify-between max-w-[360px] mx-auto w-full gap-3">
              {/* PROMINENT Back Button */}
              <button
                onClick={onBack}
                className="text-white text-xs font-bold bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                ← Menu
              </button>

              {/* Timer & Attempts - CENTER STAGE */}
              <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded border border-gray-300">
                <Timer
                  {...(state.session?.startTime && { startTime: state.session.startTime })}
                  isRunning={!state.completed && !!state.session && !state.offline && !state.session?.completed}
                />
                <div className="w-px h-4 bg-gray-300"></div>
                <AttemptCounter attempts={state.session?.attempts || 0} />
              </div>

              {/* Offline Indicator - ONLY IF NEEDED */}
              {state.offline && (
                <div className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded border border-red-200">
                  Offline
                </div>
              )}
            </div>
          </div>

          {/* Canvas - MAXIMUM SPACE */}
          <div className="flex-1 flex items-center justify-center p-3 bg-gray-100 min-h-0">
            <Canvas
              shapes={state.challenge.shapes}
              isPlayMode={true}
              {...(state.challenge.screenshotUrl && { screenshotUrl: state.challenge.screenshotUrl })}
            />
          </div>

          {/* Input - LIGHT THEME */}
          <div className="bg-white border-t border-gray-200 p-3">
            <div className="max-w-[360px] mx-auto w-full">
              <form onSubmit={handleGuessSubmit}>
                {state.inlineError && !state.loading && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-center mb-2">
                    <p className="text-xs text-red-700 mb-2">{state.inlineError}</p>
                    {!state.offline && !state.inlineError.toLowerCase().includes('you already submitted') && (
                      <button
                        onClick={() => setState(prev => ({ ...prev, inlineError: null }))}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={state.guess}
                    onChange={(e) => setState(prev => ({ ...prev, guess: e.target.value }))}
                    placeholder={state.session?.completed ? "Already completed" : "What's in the silhouette?"}
                    maxLength={50}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-200 placeholder-gray-500"
                    disabled={state.submitting || state.offline || state.session?.completed}
                  />
                  <button
                    type="submit"
                    disabled={!state.guess.trim() || state.submitting || state.offline || state.session?.completed}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold disabled:bg-gray-400 disabled:text-gray-600 hover:bg-blue-700 transition-colors"
                  >
                    Guess
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
