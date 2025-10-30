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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 flex items-center justify-center">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-3 w-full max-w-[360px] shadow-2xl mx-auto text-center">
            <h2 className="text-sm font-bold text-white mb-1">
              {state.offline ? 'Offline' : 'Error'}
            </h2>
            <p className="text-gray-300 text-xs mb-3">
              {state.offline ? 'No connection' : state.error}
            </p>
            <div className="flex gap-2 justify-center">
              {(state.retryable || state.offline) && (
                <button
                  onClick={loadChallenge}
                  disabled={state.offline}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                >
                  Retry
                </button>
              )}
              <button
                onClick={onBack}
                className="px-3 py-1 bg-white text-black rounded text-xs font-bold"
              >
                ← Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No challenge found */}
      {!state.loading && !state.error && !state.challenge && (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 flex items-center justify-center">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-3 w-full max-w-[360px] shadow-2xl mx-auto text-center">
            <h2 className="text-sm font-bold text-white mb-1">No Challenge</h2>
            <button
              onClick={onBack}
              className="px-3 py-1 bg-white text-black rounded text-xs font-bold mt-2"
            >
              ← Menu
            </button>
          </div>
        </div>
      )}

      {/* Completion state */}
      {!state.loading && !state.error && state.challenge && state.completed && state.completionData && (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 flex items-center justify-center">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-3 w-full max-w-[360px] shadow-2xl mx-auto text-center">
            <h2 className="text-base font-black text-white mb-2">SOLVED!</h2>

            <div className="mb-3">
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
                className="px-6 py-2 bg-white text-black rounded text-xs font-bold"
              >
                ← Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main challenge view - PERFECTO WITHOUT TITLE */}
      {!state.loading && !state.error && state.challenge && !state.completed && (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col">
          {/* Header - CLEAN & BALANCED */}
          <div className="bg-gray-800 border-b border-gray-700 p-2">
            <div className="flex items-center justify-between max-w-[360px] mx-auto w-full gap-3">
              {/* PROMINENT Back Button */}
              <button
                onClick={onBack}
                className="text-black text-xs font-bold bg-white px-3 py-1 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                ← Menu
              </button>

              {/* Timer & Attempts - CENTER STAGE */}
              <div className="flex items-center gap-3 bg-gray-700 px-3 py-1 rounded border border-gray-600">
                <Timer
                  {...(state.session?.startTime && { startTime: state.session.startTime })}
                  isRunning={!state.completed && !!state.session && !state.offline && !state.session?.completed}
                />
                <div className="w-px h-4 bg-gray-600"></div>
                <AttemptCounter attempts={state.session?.attempts || 0} />
              </div>

              {/* Offline Indicator - ONLY IF NEEDED */}
              {state.offline && (
                <div className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                  Offline
                </div>
              )}
            </div>
          </div>

          {/* Canvas - MAXIMUM SPACE */}
          <div className="flex-1 flex items-center justify-center p-3 bg-gray-900 min-h-0">
            <Canvas
              shapes={state.challenge.shapes}
              isPlayMode={true}
              {...(state.challenge.screenshotUrl && { screenshotUrl: state.challenge.screenshotUrl })}
            />
          </div>

          {/* Input - PERFECT POSITION */}
          <div className="bg-gray-800 border-t border-gray-700 p-3">
            <div className="max-w-[360px] mx-auto w-full">
              <form onSubmit={handleGuessSubmit}>
                {state.inlineError && !state.loading && (
                  <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-center mb-2">
                    <p className="text-xs text-red-400 mb-2">{state.inlineError}</p>
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
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-white disabled:bg-gray-600 placeholder-gray-400"
                    disabled={state.submitting || state.offline || state.session?.completed}
                  />
                  <button
                    type="submit"
                    disabled={!state.guess.trim() || state.submitting || state.offline || state.session?.completed}
                    className="px-4 py-2 bg-white text-black rounded text-sm font-bold disabled:bg-gray-600 disabled:text-gray-400 hover:bg-gray-100 transition-colors"
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
