import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Challenge, Shape } from '../../shared/types/api';

// Mock the Devvit modules
vi.mock('@devvit/web/server', () => ({
  context: {
    subredditName: 'testsubreddit',
  },
  reddit: {
    getCurrentUsername: vi.fn(),
    submitCustomPost: vi.fn(),
  },
  redis: {
    set: vi.fn(),
    get: vi.fn(),
    hSet: vi.fn(),
    hGetAll: vi.fn(),
    expire: vi.fn(),
  },
}));

describe('Challenge Redis Operations', () => {
  const mockShapes: Shape[] = [
    {
      shape: '●',
      xPercent: 50,
      yPercent: 50,
      sizePercent: 20,
      rotation: 0,
    },
  ];

  const mockChallenge: Challenge = {
    id: 'test_challenge_123',
    shapes: mockShapes,
    answer: 'test answer',
    postTitle: 'Test Challenge',
    createdBy: 'testuser',
    createdAt: 1640995200000,
    subredditName: 'testsubreddit',
    postId: 'post123',
  };

  let createChallenge: any;
  let getChallenge: any;
  let getChallengesForSubreddit: any;
  let validateGuess: any;
  let getUserSession: any;
  let updateSession: any;
  let context: any;
  let reddit: any;
  let redis: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import the mocked modules
    const devvitModule = await import('@devvit/web/server');
    context = devvitModule.context;
    reddit = devvitModule.reddit;
    redis = devvitModule.redis;

    // Import the functions to test
    const challengeModule = await import('./challenge');
    createChallenge = challengeModule.createChallenge;
    getChallenge = challengeModule.getChallenge;
    getChallengesForSubreddit = challengeModule.getChallengesForSubreddit;
    validateGuess = challengeModule.validateGuess;
    getUserSession = challengeModule.getUserSession;
    updateSession = challengeModule.updateSession;

    // Reset context
    context.subredditName = 'testsubreddit';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createChallenge', () => {
    it('should store challenge using Redis hash operations', async () => {
      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(reddit.submitCustomPost).mockResolvedValue({ id: 'post123' });
      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(redis.hSet).mockResolvedValue(1);

      // Execute
      const result = await createChallenge(mockShapes, 'test answer', 'Test Challenge');

      // Verify Redis operations
      expect(redis.set).toHaveBeenCalledWith(
        'challenge:post123',
        expect.stringContaining('"answer":"test answer"')
      );

      expect(redis.hSet).toHaveBeenCalledWith(
        'challenges:testsubreddit',
        expect.objectContaining({
          'post123': expect.any(String), // timestamp
        })
      );

      expect(result.challenge.answer).toBe('test answer');
      expect(result.challenge.postTitle).toBe('Test Challenge');
    });

    it('should handle Redis set operation failures', async () => {
      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(reddit.submitCustomPost).mockResolvedValue({ id: 'post123' });
      vi.mocked(redis.set).mockRejectedValue(new Error('Redis set failed'));

      // Execute and verify error
      await expect(
        createChallenge(mockShapes, 'test answer', 'Test Challenge')
      ).rejects.toThrow('Failed to save challenge data. Please try again.');
    });

    it('should handle Redis hSet operation failures gracefully', async () => {
      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(reddit.submitCustomPost).mockResolvedValue({ id: 'post123' });
      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(redis.hSet).mockRejectedValue(new Error('Redis hSet failed'));

      // Execute - should not throw error but log warning
      const result = await createChallenge(mockShapes, 'test answer', 'Test Challenge');

      expect(result.challenge).toBeDefined();
      expect(redis.set).toHaveBeenCalled();
      expect(redis.hSet).toHaveBeenCalled();
    });
  });

  describe('getChallenge', () => {
    it('should retrieve challenge from Redis using correct key', async () => {
      // Setup mock
      vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockChallenge));

      // Execute
      const result = await getChallenge('post123');

      // Verify
      expect(redis.get).toHaveBeenCalledWith('challenge:post123');
      expect(result).toEqual(mockChallenge);
    });

    it('should return null when challenge does not exist', async () => {
      // Setup mock
      vi.mocked(redis.get).mockResolvedValue(undefined);

      // Execute
      const result = await getChallenge('nonexistent');

      // Verify
      expect(result).toBeNull();
    });

    it('should handle Redis get operation failures', async () => {
      // Setup mock
      vi.mocked(redis.get).mockRejectedValue(new Error('Redis get failed'));

      // Execute and verify error
      await expect(getChallenge('post123')).rejects.toThrow(
        'Failed to load challenge data. Please try again.'
      );
    });

    it('should handle corrupted challenge data', async () => {
      // Setup mock with invalid JSON
      vi.mocked(redis.get).mockResolvedValue('invalid json');

      // Execute and verify error
      await expect(getChallenge('post123')).rejects.toThrow(
        'Challenge data is corrupted. Please contact support.'
      );
    });
  });

  describe('getChallengesForSubreddit', () => {
    it('should retrieve and sort challenges by timestamp (newest first)', async () => {
      const challengeHash = {
        'post1': '1640995200000', // older
        'post2': '1640995300000', // newer
        'post3': '1640995250000', // middle
      };

      const challenge1 = { ...mockChallenge, postId: 'post1', createdAt: 1640995200000 };
      const challenge2 = { ...mockChallenge, postId: 'post2', createdAt: 1640995300000 };
      const challenge3 = { ...mockChallenge, postId: 'post3', createdAt: 1640995250000 };

      // Setup mocks
      vi.mocked(redis.hGetAll).mockResolvedValue(challengeHash);
      vi.mocked(redis.get)
        .mockResolvedValueOnce(JSON.stringify(challenge2)) // post2 (newest)
        .mockResolvedValueOnce(JSON.stringify(challenge3)) // post3 (middle)
        .mockResolvedValueOnce(JSON.stringify(challenge1)); // post1 (oldest)

      // Execute
      const result = await getChallengesForSubreddit();

      // Verify correct Redis operations
      expect(redis.hGetAll).toHaveBeenCalledWith('challenges:testsubreddit');
      expect(redis.get).toHaveBeenCalledTimes(3);

      // Verify sorting (newest first)
      expect(result).toHaveLength(3);
      expect(result[0].postId).toBe('post2'); // newest
      expect(result[1].postId).toBe('post3'); // middle
      expect(result[2].postId).toBe('post1'); // oldest
    });

    it('should handle empty challenge list gracefully', async () => {
      // Setup mock for empty hash
      vi.mocked(redis.hGetAll).mockResolvedValue({});

      // Execute
      const result = await getChallengesForSubreddit();

      // Verify
      expect(result).toEqual([]);
      expect(redis.get).not.toHaveBeenCalled();
    });

    it('should handle Redis hGetAll operation failures', async () => {
      // Setup mock
      vi.mocked(redis.hGetAll).mockRejectedValue(new Error('Redis hGetAll failed'));

      // Execute and verify error
      await expect(getChallengesForSubreddit()).rejects.toThrow(
        'Failed to load challenge list. Please try again.'
      );
    });

    it('should filter out corrupted challenge data while maintaining order', async () => {
      const challengeHash = {
        'post1': '1640995200000',
        'post2': '1640995300000',
        'post3': '1640995250000',
      };

      const validChallenge = { ...mockChallenge, postId: 'post1' };

      // Setup mocks - post2 has corrupted data, post3 fails to retrieve
      vi.mocked(redis.hGetAll).mockResolvedValue(challengeHash);
      vi.mocked(redis.get)
        .mockResolvedValueOnce('invalid json') // post2 (corrupted)
        .mockResolvedValueOnce(JSON.stringify(validChallenge)) // post3 (valid)
        .mockRejectedValueOnce(new Error('Redis error')); // post1 (error)

      // Execute
      const result = await getChallengesForSubreddit();

      // Verify only valid challenge is returned
      expect(result).toHaveLength(1);
      expect(result[0].postId).toBe('post1');
    });

    it('should handle missing subredditName in context', async () => {
      // Setup mock
      context.subredditName = '';

      // Execute and verify error
      await expect(getChallengesForSubreddit()).rejects.toThrow(
        'subredditName is required'
      );
    });
  });

  describe('Redis key generation', () => {
    it('should generate correct Redis keys for challenges', async () => {
      // Setup mocks
      vi.mocked(reddit.getCurrentUsername).mockResolvedValue('testuser');
      vi.mocked(reddit.submitCustomPost).mockResolvedValue({ id: 'post123' });
      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(redis.hSet).mockResolvedValue(1);

      // Execute
      await createChallenge(mockShapes, 'test answer', 'Test Challenge');

      // Verify correct key patterns
      expect(redis.set).toHaveBeenCalledWith(
        'challenge:post123',
        expect.any(String)
      );

      expect(redis.hSet).toHaveBeenCalledWith(
        'challenges:testsubreddit',
        expect.any(Object)
      );
    });
  });

  describe('validateGuess', () => {
    it('should validate correct guess with case-insensitive matching', () => {
      const challenge = { ...mockChallenge, answer: 'house' };

      expect(validateGuess('house', challenge)).toBe(true);
      expect(validateGuess('HOUSE', challenge)).toBe(true);
      expect(validateGuess('House', challenge)).toBe(true);
      expect(validateGuess('HoUsE', challenge)).toBe(true);
    });

    it('should handle whitespace in guesses', () => {
      const challenge = { ...mockChallenge, answer: 'house' };

      expect(validateGuess('  house  ', challenge)).toBe(true);
      expect(validateGuess(' HOUSE ', challenge)).toBe(true);
      expect(validateGuess('house\n', challenge)).toBe(true);
    });

    it('should reject incorrect guesses', () => {
      const challenge = { ...mockChallenge, answer: 'house' };

      expect(validateGuess('car', challenge)).toBe(false);
      expect(validateGuess('houses', challenge)).toBe(false);
      expect(validateGuess('hous', challenge)).toBe(false);
    });

    it('should handle empty or invalid inputs', () => {
      const challenge = { ...mockChallenge, answer: 'house' };

      expect(validateGuess('', challenge)).toBe(false);
      expect(validateGuess('   ', challenge)).toBe(false);
      expect(validateGuess('house', null as any)).toBe(false);
      expect(validateGuess('house', { ...challenge, answer: '' })).toBe(false);
    });

    it('should handle multi-word answers', () => {
      const challenge = { ...mockChallenge, answer: 'red car' };

      expect(validateGuess('red car', challenge)).toBe(true);
      expect(validateGuess('RED CAR', challenge)).toBe(true);
      expect(validateGuess('  Red Car  ', challenge)).toBe(true);
      expect(validateGuess('redcar', challenge)).toBe(false);
    });
  });

  describe('getUserSession', () => {
    beforeEach(() => {
      vi.mocked(redis.expire).mockResolvedValue(1);
    });

    it('should create new session when none exists', async () => {
      vi.mocked(redis.get).mockResolvedValue(undefined);
      vi.mocked(redis.set).mockResolvedValue('OK');

      const session = await getUserSession('testuser', 'post123');

      expect(session.username).toBe('testuser');
      expect(session.postId).toBe('post123');
      expect(session.attempts).toBe(0);
      expect(session.completed).toBe(false);
      expect(session.sessionId).toMatch(/^sess_/);
      expect(session.startTime).toBeGreaterThan(0);

      expect(redis.set).toHaveBeenCalledWith(
        'session:post123:testuser',
        expect.stringContaining('"username":"testuser"')
      );
      expect(redis.expire).toHaveBeenCalled();
    });

    it('should return existing valid session', async () => {
      const existingSession = {
        sessionId: 'sess_existing',
        username: 'testuser',
        postId: 'post123',
        startTime: Date.now() - 1000, // 1 second ago
        attempts: 3,
        completed: false,
      };

      vi.mocked(redis.get).mockResolvedValue(JSON.stringify(existingSession));

      const session = await getUserSession('testuser', 'post123');

      expect(session).toEqual(existingSession);
      expect(redis.set).not.toHaveBeenCalled(); // Should not create new session
    });

    it('should create new session when existing session is expired', async () => {
      const expiredSession = {
        sessionId: 'sess_expired',
        username: 'testuser',
        postId: 'post123',
        startTime: Date.now() - (31 * 60 * 1000), // 31 minutes ago (expired)
        attempts: 3,
        completed: false,
      };

      vi.mocked(redis.get).mockResolvedValue(JSON.stringify(expiredSession));
      vi.mocked(redis.set).mockResolvedValue('OK');

      const session = await getUserSession('testuser', 'post123');

      expect(session.sessionId).not.toBe('sess_expired');
      expect(session.attempts).toBe(0); // New session should reset attempts
      expect(session.startTime).toBeGreaterThan(expiredSession.startTime);

      expect(redis.set).toHaveBeenCalled(); // Should create new session
    });

    it('should handle Redis failures gracefully', async () => {
      vi.mocked(redis.get).mockRejectedValue(new Error('Redis error'));
      vi.mocked(redis.set).mockResolvedValue('OK');

      const session = await getUserSession('testuser', 'post123');

      expect(session.username).toBe('testuser');
      expect(session.postId).toBe('post123');
      expect(session.attempts).toBe(0);
    });

    it('should require username and postId', async () => {
      await expect(getUserSession('', 'post123')).rejects.toThrow(
        'Username and postId are required'
      );
      await expect(getUserSession('testuser', '')).rejects.toThrow(
        'Username and postId are required'
      );
    });
  });

  describe('updateSession', () => {
    it('should update session data in Redis', async () => {
      const session = {
        sessionId: 'sess_test',
        username: 'testuser',
        postId: 'post123',
        startTime: Date.now(),
        attempts: 5,
        completed: false,
      };

      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(redis.expire).mockResolvedValue(1);

      const result = await updateSession(session);

      expect(result).toEqual(session);
      expect(redis.set).toHaveBeenCalledWith(
        'session:post123:testuser',
        JSON.stringify(session)
      );
      expect(redis.expire).toHaveBeenCalled(); // Should refresh TTL for active session
    });

    it('should not refresh TTL for completed sessions', async () => {
      const completedSession = {
        sessionId: 'sess_test',
        username: 'testuser',
        postId: 'post123',
        startTime: Date.now(),
        attempts: 3,
        completed: true,
      };

      vi.mocked(redis.set).mockResolvedValue('OK');

      await updateSession(completedSession);

      expect(redis.set).toHaveBeenCalled();
      expect(redis.expire).not.toHaveBeenCalled(); // Should not refresh TTL for completed session
    });

    it('should handle Redis update failures', async () => {
      const session = {
        sessionId: 'sess_test',
        username: 'testuser',
        postId: 'post123',
        startTime: Date.now(),
        attempts: 1,
        completed: false,
      };

      vi.mocked(redis.set).mockRejectedValue(new Error('Redis error'));

      await expect(updateSession(session)).rejects.toThrow(
        'Failed to save session data. Please try again.'
      );
    });

    it('should validate session data', async () => {
      await expect(updateSession(null as any)).rejects.toThrow(
        'Invalid session data'
      );

      await expect(updateSession({} as any)).rejects.toThrow(
        'Invalid session data'
      );

      await expect(updateSession({
        sessionId: 'sess_test',
        username: '',
        postId: 'post123',
        startTime: Date.now(),
        attempts: 1,
        completed: false,
      })).rejects.toThrow('Invalid session data');
    });
  });
});
