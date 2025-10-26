import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  challengeApi,
  ApiError,
  NetworkError,
  TimeoutError,
  handleApiError,
  isOnline,
  addOfflineListener
} from './api';
import type {
  ChallengeResponse,
  GuessSubmissionRequest,
  GuessSubmissionResponse,
  LeaderboardResponse
} from '../../shared/types/api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Error Classes', () => {
  it('should create ApiError with correct properties', () => {
    const error = new ApiError('Test error', 404, true);

    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('ApiError');
  });

  it('should create NetworkError with default message', () => {
    const error = new NetworkError();

    expect(error.message).toBe('Network connection failed');
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('NetworkError');
  });

  it('should create TimeoutError with default message', () => {
    const error = new TimeoutError();

    expect(error.message).toBe('Request timed out');
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('TimeoutError');
  });
});

describe('challengeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getChallenge', () => {
    it('should fetch challenge data successfully', async () => {
      const mockResponse: ChallengeResponse = {
        challenge: {
          id: 'test-challenge',
          shapes: [],
          answer: 'test',
          postTitle: 'Test Challenge',
          createdBy: 'user',
          createdAt: Date.now(),
          subredditName: 'test',
          postId: 'post123',
        },
        session: {
          sessionId: 'session123',
          username: 'user',
          postId: 'post123',
          startTime: Date.now(),
          attempts: 0,
          completed: false,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await challengeApi.getChallenge('post123');

      expect(mockFetch).toHaveBeenCalledWith('/api/challenge/post123', {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Challenge not found'),
      });

      await expect(challengeApi.getChallenge('nonexistent')).rejects.toThrow(
        'API request failed: 404 Not Found - Challenge not found'
      );
    });

    it('should encode postId in URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await challengeApi.getChallenge('post with spaces');

      expect(mockFetch).toHaveBeenCalledWith('/api/challenge/post%20with%20spaces', {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe('submitGuess', () => {
    it('should submit guess successfully', async () => {
      const mockRequest: GuessSubmissionRequest = {
        postId: 'post123',
        guess: 'test answer',
        sessionId: 'session123',
      };

      const mockResponse: GuessSubmissionResponse = {
        correct: true,
        attempts: 3,
        timeElapsed: 45,
        leaderboardPosition: 5,
        message: 'Correct!',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await challengeApi.submitGuess(mockRequest);

      expect(mockFetch).toHaveBeenCalledWith('/api/submit-guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRequest),
        signal: expect.any(AbortSignal),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle incorrect guess response', async () => {
      const mockRequest: GuessSubmissionRequest = {
        postId: 'post123',
        guess: 'wrong answer',
        sessionId: 'session123',
      };

      const mockResponse: GuessSubmissionResponse = {
        correct: false,
        attempts: 2,
        message: 'Try again',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await challengeApi.submitGuess(mockRequest);

      expect(result.correct).toBe(false);
      expect(result.attempts).toBe(2);
    });
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard data successfully', async () => {
      const mockResponse: LeaderboardResponse = {
        leaderboard: [
          {
            username: 'user1',
            attempts: 2,
            completionTime: 45,
            completedAt: Date.now(),
            rank: 1,
          },
        ],
        userRank: 1,
        totalPlayers: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await challengeApi.getLeaderboard('post123');

      expect(mockFetch).toHaveBeenCalledWith('/api/leaderboard/post123', {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retry logic', () => {
    it('should retry on 500 errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.resolve('Server error'),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const result = await challengeApi.getChallenge('post123');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it('should not retry on 400 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid request'),
      });

      await expect(challengeApi.getChallenge('post123')).rejects.toThrow(
        'API request failed: 400 Bad Request - Invalid request'
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors with retry', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const result = await challengeApi.getChallenge('post123');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });
  });

  // Note: Timeout handling is tested implicitly through the fetch wrapper
  // but explicit timeout tests are complex in the test environment
});

describe('handleApiError', () => {
  it('should handle ApiError correctly', () => {
    const error = new ApiError('Test error', 404, true);
    const result = handleApiError(error);

    expect(result.error).toBe('Test error');
    expect(result.retryable).toBe(true);
  });

  it('should handle NetworkError correctly', () => {
    const error = new NetworkError();
    const result = handleApiError(error);

    expect(result.error).toBe('Network connection failed. Please check your internet connection.');
    expect(result.retryable).toBe(true);
  });

  it('should handle TimeoutError correctly', () => {
    const error = new TimeoutError();
    const result = handleApiError(error);

    expect(result.error).toBe('Request timed out. Please try again.');
    expect(result.retryable).toBe(true);
  });

  it('should handle generic Error correctly', () => {
    const error = new Error('Generic error');
    const result = handleApiError(error);

    expect(result.error).toBe('Generic error');
    expect(result.retryable).toBe(false);
  });

  it('should handle unknown error types', () => {
    const error = 'String error';
    const result = handleApiError(error);

    expect(result.error).toBe('An unexpected error occurred');
    expect(result.retryable).toBe(false);
  });
});

describe('offline detection', () => {
  it('should detect online status', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    });

    expect(isOnline()).toBe(true);
  });

  it('should detect offline status', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    });

    expect(isOnline()).toBe(false);
  });

  it('should add and remove offline listeners', () => {
    const callback = vi.fn();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const removeListener = addOfflineListener(callback);

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    removeListener();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});
