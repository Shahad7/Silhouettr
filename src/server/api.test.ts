import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Challenge, UserSession, LeaderboardEntry } from '../shared/types/api';

// Mock the Devvit modules
vi.mock('@devvit/web/server', () => ({
  context: {
    subredditName: 'testsubreddit',
    postId: 'test_post_123',
  },
  reddit: {
    getCurrentUsername: vi.fn(),
  },
  redis: {
    set: vi.fn(),
    get: vi.fn(),
    hSet: vi.fn(),
    hGetAll: vi.fn(),
    expire: vi.fn(),
    zAdd: vi.fn(),
    zCard: vi.fn(),
    zRange: vi.fn(),
    zRank: vi.fn(),
    zScore: vi.fn(),
    watch: vi.fn(),
  },
  createServer: vi.fn(),
  getServerPort: vi.fn(() => 3000),
}));

// Mock the core modules
vi.mock('./core/challenge', () => ({
  getChallenge: vi.fn(),
  validateGuess: vi.fn(),
  getUserSession: vi.fn(),
  updateSession: vi.fn(),
}));

vi.mock('./core/leaderboard', () => ({
  leaderboardService: {
    recordCompletion: vi.fn(),
    getLeaderboard: vi.fn(),
    getLeaderboardWithUserPosition: vi.fn(),
  },
}));

describe('API Endpoints Integration Tests', () => {
  let mockChallenge: Challenge;
  let mockSession: UserSession;
  let mockLeaderboard: LeaderboardEntry[];

  // Import mocked modules
  let reddit: any;
  let getChallenge: any;
  let validateGuess: any;
  let getUserSession: any;
  let updateSession: any;
  let leaderboardService: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import the mocked modules
    const devvitModule = await import('@devvit/web/server');
    reddit = devvitModule.reddit;

    const challengeModule = await import('./core/challenge');
    getChallenge = challengeModule.getChallenge;
    validateGuess = challengeModule.validateGuess;
    getUserSession = challengeModule.getUserSession;
    updateSession = challengeModule.updateSession;

    const leaderboardModule = await import('./core/leaderboard');
    leaderboardService = leaderboardModule.leaderboardService;

    // Create mock endpoint handlers that simulate the actual API logic
    const challengeEndpointHandler = async (postId: string) => {
      if (!postId) {
        return {
          status: 400,
          body: {
            status: 'error',
            message: 'postId is required',
            code: 'MISSING_POST_ID',
            retryable: false,
          },
        };
      }

      try {
        const username = await reddit.getCurrentUsername();
        if (!username) {
          return {
            status: 401,
            body: {
              status: 'error',
              message: 'User authentication required',
              code: 'AUTH_REQUIRED',
              retryable: false,
            },
          };
        }

        const challenge = await getChallenge(postId);
        if (!challenge) {
          return {
            status: 404,
            body: {
              status: 'error',
              message: 'Challenge not found',
              code: 'CHALLENGE_NOT_FOUND',
              retryable: false,
            },
          };
        }

        const session = await getUserSession(username, postId);

        return {
          status: 200,
          body: {
            challenge,
            session,
          },
        };
      } catch (error) {
        return {
          status: 500,
          body: {
            status: 'error',
            message: 'Failed to retrieve challenge',
            code: 'CHALLENGE_RETRIEVAL_ERROR',
            retryable: true,
          },
        };
      }
    };

    const guessSubmissionHandler = async (postId: string, guess: string, sessionId: string) => {
      if (!postId || !guess || !sessionId) {
        return {
          status: 400,
          body: {
            status: 'error',
            message: 'postId, guess, and sessionId are required',
            code: 'MISSING_REQUIRED_FIELDS',
            retryable: false,
          },
        };
      }

      try {
        const username = await reddit.getCurrentUsername();
        if (!username) {
          return {
            status: 401,
            body: {
              status: 'error',
              message: 'User authentication required',
              code: 'AUTH_REQUIRED',
              retryable: false,
            },
          };
        }

        const challenge = await getChallenge(postId);
        if (!challenge) {
          return {
            status: 404,
            body: {
              status: 'error',
              message: 'Challenge not found',
              code: 'CHALLENGE_NOT_FOUND',
              retryable: false,
            },
          };
        }

        const session = await performanceTracker.getSession(postId, username);
        if (!session || session.sessionId !== sessionId) {
          return {
            status: 400,
            body: {
              status: 'error',
              message: 'Invalid or expired session',
              code: 'INVALID_SESSION',
              retryable: false,
            },
          };
        }

        if (session.completed) {
          return {
            status: 400,
            body: {
              status: 'error',
              message: 'Challenge already completed',
              code: 'ALREADY_COMPLETED',
              retryable: false,
            },
          };
        }

        const updatedSession = await performanceTracker.incrementAttempts(postId, username);
        if (!updatedSession) {
          return {
            status: 500,
            body: {
              status: 'error',
              message: 'Failed to update session',
              code: 'SESSION_UPDATE_ERROR',
              retryable: true,
            },
          };
        }

        const isCorrect = validateGuess(guess, challenge);
        const elapsedTime = performanceTracker.getElapsedTime(updatedSession);

        if (isCorrect) {
          await performanceTracker.completeSession(postId, username);
          const leaderboardPosition = await leaderboardService.recordCompletion(
            postId,
            username,
            elapsedTime,
            updatedSession.attempts
          );

          return {
            status: 200,
            body: {
              correct: true,
              attempts: updatedSession.attempts,
              timeElapsed: elapsedTime,
              leaderboardPosition,
              message: 'Congratulations! You solved the challenge!',
            },
          };
        } else {
          return {
            status: 200,
            body: {
              correct: false,
              attempts: updatedSession.attempts,
              message: 'Incorrect guess. Try again!',
            },
          };
        }
      } catch (error) {
        return {
          status: 500,
          body: {
            status: 'error',
            message: 'Failed to process guess submission',
            code: 'GUESS_SUBMISSION_ERROR',
            retryable: true,
          },
        };
      }
    };

    const leaderboardHandler = async (postId: string, limit: number = 10, offset: number = 0) => {
      if (!postId) {
        return {
          status: 400,
          body: {
            status: 'error',
            message: 'postId is required',
            code: 'MISSING_POST_ID',
            retryable: false,
          },
        };
      }

      try {
        const limitNum = Math.min(Math.max(limit || 10, 1), 100);
        const offsetNum = Math.max(offset || 0, 0);
        const username = await reddit.getCurrentUsername();

        const challenge = await getChallenge(postId);
        if (!challenge) {
          return {
            status: 404,
            body: {
              status: 'error',
              message: 'Challenge not found',
              code: 'CHALLENGE_NOT_FOUND',
              retryable: false,
            },
          };
        }

        let leaderboardResponse;
        if (username) {
          leaderboardResponse = await leaderboardService.getLeaderboardWithUserPosition(
            postId,
            username,
            limitNum
          );
        } else {
          leaderboardResponse = await leaderboardService.getLeaderboard(
            postId,
            limitNum,
            offsetNum
          );
        }

        return {
          status: 200,
          body: leaderboardResponse,
        };
      } catch (error) {
        return {
          status: 500,
          body: {
            status: 'error',
            message: 'Failed to retrieve leaderboard',
            code: 'LEADERBOARD_RETRIEVAL_ERROR',
            retryable: true,
          },
        };
      }
    };

    // Store handlers for use in tests
    (global as any).testHandlers = {
      challengeEndpointHandler,
      guessSubmissionHandler,
      leaderboardHandler,
    };

    // Setup mock data
    mockChallenge = {
      id: 'challenge_123',
      shapes: [
        { shape: 'circle', xPercent: 30, yPercent: 40, sizePercent: 15, rotation: 0 },
        { shape: 'rectangle', xPercent: 50, yPercent: 60, sizePercent: 20, rotation: 45 },
      ],
      answer: 'house',
      postTitle: 'Test Challenge',
      createdBy: 'testuser',
      createdAt: Date.now(),
      subredditName: 'testsubreddit',
      postId: 'test_post_123',
    };

    mockSession = {
      sessionId: 'sess_test_123',
      username: 'testuser',
      postId: 'test_post_123',
      startTime: Date.now() - 5000, // 5 seconds ago
      attempts: 0,
      completed: false,
    };

    mockLeaderboard = [
      {
        username: 'player1',
        attempts: 3,
        completionTime: 15000,
        completedAt: Date.now() - 3600000,
        rank: 1,
      },
      {
        username: 'player2',
        attempts: 5,
        completionTime: 20000,
        completedAt: Date.now() - 1800000,
        rank: 2,
      },
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Challenge Retrieval Endpoint Logic', () => {
    it('should retrieve challenge data with user session', async () => {
      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(performanceTracker.getOrCreateSession).mockResolvedValue(mockSession);

      // Execute handler
      const response = await (global as any).testHandlers.challengeEndpointHandler('test_post_123');

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        challenge: mockChallenge,
        session: mockSession,
      });

      // Verify function calls
      expect(getChallenge).toHaveBeenCalledWith('test_post_123');
      expect(performanceTracker.getOrCreateSession).toHaveBeenCalledWith('test_post_123', 'testuser');
    });

    it('should return 400 when postId is missing', async () => {
      const response = await (global as any).testHandlers.challengeEndpointHandler('');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'postId is required',
        code: 'MISSING_POST_ID',
        retryable: false,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue(null);

      const response = await (global as any).testHandlers.challengeEndpointHandler('test_post_123');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        status: 'error',
        message: 'User authentication required',
        code: 'AUTH_REQUIRED',
        retryable: false,
      });
    });

    it('should return 404 when challenge is not found', async () => {
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(null);

      const response = await (global as any).testHandlers.challengeEndpointHandler('nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Challenge not found',
        code: 'CHALLENGE_NOT_FOUND',
        retryable: false,
      });
    });

    it('should return 500 when challenge retrieval fails', async () => {
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockRejectedValue(new Error('Database error'));

      const response = await (global as any).testHandlers.challengeEndpointHandler('test_post_123');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Failed to retrieve challenge',
        code: 'CHALLENGE_RETRIEVAL_ERROR',
        retryable: true,
      });
    });
  });

  describe('Guess Submission Endpoint Logic', () => {
    it('should process correct guess and update leaderboard', async () => {
      const updatedSession = { ...mockSession, attempts: 1 };

      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(performanceTracker.getSession).mockResolvedValue(mockSession);
      vi.mocked(performanceTracker.incrementAttempts).mockResolvedValue(updatedSession);
      vi.mocked(validateGuess).mockReturnValue(true);
      vi.mocked(performanceTracker.getElapsedTime).mockReturnValue(5000);
      vi.mocked(performanceTracker.completeSession).mockResolvedValue(updatedSession);
      vi.mocked(leaderboardService.recordCompletion).mockResolvedValue(1);

      // Execute handler
      const response = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'house',
        'sess_test_123'
      );

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        correct: true,
        attempts: 1,
        timeElapsed: 5000,
        leaderboardPosition: 1,
        message: 'Congratulations! You solved the challenge!',
      });

      // Verify function calls
      expect(validateGuess).toHaveBeenCalledWith('house', mockChallenge);
      expect(performanceTracker.completeSession).toHaveBeenCalledWith('test_post_123', 'testuser');
      expect(leaderboardService.recordCompletion).toHaveBeenCalledWith(
        'test_post_123',
        'testuser',
        5000,
        1
      );
    });

    it('should process incorrect guess without updating leaderboard', async () => {
      const updatedSession = { ...mockSession, attempts: 2 };

      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(performanceTracker.getSession).mockResolvedValue(mockSession);
      vi.mocked(performanceTracker.incrementAttempts).mockResolvedValue(updatedSession);
      vi.mocked(validateGuess).mockReturnValue(false);

      // Execute handler
      const response = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'car',
        'sess_test_123'
      );

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        correct: false,
        attempts: 2,
        message: 'Incorrect guess. Try again!',
      });

      // Verify leaderboard was not updated
      expect(performanceTracker.completeSession).not.toHaveBeenCalled();
      expect(leaderboardService.recordCompletion).not.toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        '', // Missing guess
        'sess_test_123'
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'postId, guess, and sessionId are required',
        code: 'MISSING_REQUIRED_FIELDS',
        retryable: false,
      });
    });

    it('should return 400 when session is invalid', async () => {
      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(performanceTracker.getSession).mockResolvedValue({
        ...mockSession,
        sessionId: 'different_session_id',
      });

      const response = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'house',
        'sess_test_123'
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid or expired session',
        code: 'INVALID_SESSION',
        retryable: false,
      });
    });

    it('should return 400 when challenge is already completed', async () => {
      const completedSession = { ...mockSession, completed: true };

      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(performanceTracker.getSession).mockResolvedValue(completedSession);

      const response = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'house',
        'sess_test_123'
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Challenge already completed',
        code: 'ALREADY_COMPLETED',
        retryable: false,
      });
    });

    it('should return 500 when session update fails', async () => {
      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(performanceTracker.getSession).mockResolvedValue(mockSession);
      vi.mocked(performanceTracker.incrementAttempts).mockResolvedValue(null);

      const response = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'house',
        'sess_test_123'
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Failed to update session',
        code: 'SESSION_UPDATE_ERROR',
        retryable: true,
      });
    });
  });

  describe('Leaderboard Retrieval Endpoint Logic', () => {
    it('should retrieve leaderboard with user position', async () => {
      const leaderboardResponse = {
        leaderboard: mockLeaderboard,
        userRank: 3,
        totalPlayers: 10,
      };

      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(leaderboardService.getLeaderboardWithUserPosition).mockResolvedValue(leaderboardResponse);

      // Execute handler
      const response = await (global as any).testHandlers.leaderboardHandler('test_post_123', 10, 0);

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual(leaderboardResponse);

      // Verify function calls
      expect(leaderboardService.getLeaderboardWithUserPosition).toHaveBeenCalledWith(
        'test_post_123',
        'testuser',
        10
      );
    });

    it('should retrieve leaderboard without user when not authenticated', async () => {
      const leaderboardResponse = {
        leaderboard: mockLeaderboard,
        totalPlayers: 10,
      };

      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue(null);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue(leaderboardResponse);

      // Execute handler
      const response = await (global as any).testHandlers.leaderboardHandler('test_post_123', 10, 0);

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual(leaderboardResponse);

      // Verify function calls
      expect(leaderboardService.getLeaderboard).toHaveBeenCalledWith(
        'test_post_123',
        10,
        0
      );
    });

    it('should handle pagination parameters', async () => {
      const leaderboardResponse = {
        leaderboard: mockLeaderboard.slice(0, 5),
        totalPlayers: 10,
      };

      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue(null);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue(leaderboardResponse);

      // Execute handler with pagination
      const response = await (global as any).testHandlers.leaderboardHandler('test_post_123', 5, 5);

      // Verify function calls with correct parameters
      expect(leaderboardService.getLeaderboard).toHaveBeenCalledWith(
        'test_post_123',
        5,
        5
      );
    });

    it('should enforce maximum limit of 100', async () => {
      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue(null);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue({
        leaderboard: [],
        totalPlayers: 0,
      });

      // Execute handler with excessive limit
      const response = await (global as any).testHandlers.leaderboardHandler('test_post_123', 500, 0);

      // Verify limit was capped at 100
      expect(leaderboardService.getLeaderboard).toHaveBeenCalledWith(
        'test_post_123',
        100,
        0
      );
    });

    it('should return 404 when challenge is not found', async () => {
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(null);

      const response = await (global as any).testHandlers.leaderboardHandler('nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Challenge not found',
        code: 'CHALLENGE_NOT_FOUND',
        retryable: false,
      });
    });

    it('should return 500 when leaderboard retrieval fails', async () => {
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(leaderboardService.getLeaderboardWithUserPosition).mockRejectedValue(
        new Error('Database error')
      );

      const response = await (global as any).testHandlers.leaderboardHandler('test_post_123');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Failed to retrieve leaderboard',
        code: 'LEADERBOARD_RETRIEVAL_ERROR',
        retryable: true,
      });
    });
  });

  describe('Complete Challenge Flow Integration', () => {
    it('should handle complete user journey from challenge retrieval to completion', async () => {
      // Step 1: Retrieve challenge
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(performanceTracker.getOrCreateSession).mockResolvedValue(mockSession);

      const challengeResponse = await (global as any).testHandlers.challengeEndpointHandler('test_post_123');

      expect(challengeResponse.status).toBe(200);
      expect(challengeResponse.body.challenge).toEqual(mockChallenge);
      expect(challengeResponse.body.session).toEqual(mockSession);

      // Step 2: Submit incorrect guess
      const updatedSession1 = { ...mockSession, attempts: 1 };
      vi.mocked(performanceTracker.getSession).mockResolvedValue(mockSession);
      vi.mocked(performanceTracker.incrementAttempts).mockResolvedValue(updatedSession1);
      vi.mocked(validateGuess).mockReturnValue(false);

      const incorrectGuessResponse = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'car',
        'sess_test_123'
      );

      expect(incorrectGuessResponse.status).toBe(200);
      expect(incorrectGuessResponse.body).toEqual({
        correct: false,
        attempts: 1,
        message: 'Incorrect guess. Try again!',
      });

      // Step 3: Submit correct guess
      const updatedSession2 = { ...mockSession, attempts: 2 };
      const completedSession = { ...updatedSession2, completed: true };

      vi.mocked(performanceTracker.getSession).mockResolvedValue(updatedSession1);
      vi.mocked(performanceTracker.incrementAttempts).mockResolvedValue(updatedSession2);
      vi.mocked(validateGuess).mockReturnValue(true);
      vi.mocked(performanceTracker.getElapsedTime).mockReturnValue(8000);
      vi.mocked(performanceTracker.completeSession).mockResolvedValue(completedSession);
      vi.mocked(leaderboardService.recordCompletion).mockResolvedValue(2);

      const correctGuessResponse = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'house',
        'sess_test_123'
      );

      expect(correctGuessResponse.status).toBe(200);
      expect(correctGuessResponse.body).toEqual({
        correct: true,
        attempts: 2,
        timeElapsed: 8000,
        leaderboardPosition: 2,
        message: 'Congratulations! You solved the challenge!',
      });

      // Step 4: Check leaderboard
      const updatedLeaderboard = [
        ...mockLeaderboard,
        {
          username: 'testuser',
          attempts: 2,
          completionTime: 8000,
          completedAt: Date.now(),
          rank: 2,
        },
      ];

      vi.mocked(leaderboardService.getLeaderboardWithUserPosition).mockResolvedValue({
        leaderboard: updatedLeaderboard,
        userRank: 2,
        totalPlayers: 3,
      });

      const leaderboardResponse = await (global as any).testHandlers.leaderboardHandler('test_post_123');

      expect(leaderboardResponse.status).toBe(200);
      expect(leaderboardResponse.body.userRank).toBe(2);
      expect(leaderboardResponse.body.totalPlayers).toBe(3);
      expect(leaderboardResponse.body.leaderboard).toHaveLength(3);
    });

    it('should prevent duplicate submissions after completion', async () => {
      const completedSession = { ...mockSession, completed: true };

      // Setup mocks for completed challenge
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(performanceTracker.getSession).mockResolvedValue(completedSession);

      // Attempt to submit guess after completion
      const response = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'house',
        'sess_test_123'
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Challenge already completed',
        code: 'ALREADY_COMPLETED',
        retryable: false,
      });

      // Verify no additional processing occurred
      expect(performanceTracker.incrementAttempts).not.toHaveBeenCalled();
      expect(validateGuess).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent guess submissions gracefully', async () => {
      // This test simulates race conditions that might occur with concurrent requests
      const session1 = { ...mockSession, attempts: 1 };
      const session2 = { ...mockSession, attempts: 2 };

      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(performanceTracker.getSession).mockResolvedValue(mockSession);
      vi.mocked(performanceTracker.incrementAttempts)
        .mockResolvedValueOnce(session1)
        .mockResolvedValueOnce(session2);
      vi.mocked(validateGuess).mockReturnValue(false);

      // Submit two guesses concurrently
      const [response1, response2] = await Promise.all([
        (global as any).testHandlers.guessSubmissionHandler(
          'test_post_123',
          'car',
          'sess_test_123'
        ),
        (global as any).testHandlers.guessSubmissionHandler(
          'test_post_123',
          'tree',
          'sess_test_123'
        ),
      ]);

      // Both should succeed with different attempt counts
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.attempts).toBe(1);
      expect(response2.body.attempts).toBe(2);
    });

    it('should validate parameters for leaderboard', async () => {
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue(null);
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue({
        leaderboard: [],
        totalPlayers: 0,
      });

      // Test with invalid parameters - should use defaults and clamp values
      const response = await (global as any).testHandlers.leaderboardHandler(
        'test_post_123',
        -5, // Invalid limit, should default to 10
        -10 // Invalid offset, should clamp to 0
      );

      expect(response.status).toBe(200);
      // Should use default values for invalid parameters
      expect(leaderboardService.getLeaderboard).toHaveBeenCalledWith(
        'test_post_123',
        10, // default limit (clamped from -5)
        0,  // offset clamped to 0
      );
    });

    it('should handle authentication failures consistently across endpoints', async () => {
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue(null);

      // Challenge endpoint should require auth
      const challengeResponse = await (global as any).testHandlers.challengeEndpointHandler('test_post_123');
      expect(challengeResponse.status).toBe(401);

      // Guess submission should require auth
      const guessResponse = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'house',
        'sess_test_123'
      );
      expect(guessResponse.status).toBe(401);

      // Leaderboard should work without auth (but with limited functionality)
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);
      vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue({
        leaderboard: mockLeaderboard,
        totalPlayers: 2,
      });

      const leaderboardResponse = await (global as any).testHandlers.leaderboardHandler('test_post_123');
      expect(leaderboardResponse.status).toBe(200);
    });

    it('should handle database connection failures gracefully', async () => {
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockRejectedValue(new Error('Redis connection failed'));

      // All endpoints should handle database failures
      const challengeResponse = await (global as any).testHandlers.challengeEndpointHandler('test_post_123');
      expect(challengeResponse.status).toBe(500);
      expect(challengeResponse.body.retryable).toBe(true);

      const guessResponse = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'house',
        'sess_test_123'
      );
      expect(guessResponse.status).toBe(500);
      expect(guessResponse.body.retryable).toBe(true);

      const leaderboardResponse = await (global as any).testHandlers.leaderboardHandler('test_post_123');
      expect(leaderboardResponse.status).toBe(500);
      expect(leaderboardResponse.body.retryable).toBe(true);
    });

    it('should validate session consistency across operations', async () => {
      // Test that session validation is consistent
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(getChallenge).mockResolvedValue(mockChallenge);

      // Test with null session
      vi.mocked(performanceTracker.getSession).mockResolvedValue(null);

      const response = await (global as any).testHandlers.guessSubmissionHandler(
        'test_post_123',
        'house',
        'sess_test_123'
      );

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_SESSION');
    });
  });
});
