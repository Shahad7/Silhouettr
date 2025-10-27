import { context, reddit, redis } from '@devvit/web/server';
import { Challenge, Shape, REDIS_KEYS, UserSession } from '../../shared/types/api';

// Generate unique challenge ID
const generateChallengeId = (): string => {
  return '_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
};

// Default challenge configuration
const DEFAULT_CHALLENGE: Omit<Challenge, 'id' | 'createdAt' | 'postId' | 'createdBy' | 'subredditName'> = {
  shapes: [
    { shape: '▲', xPercent: 50, yPercent: 25, sizePercent: 18, rotation: 0 }, // Roof
    { shape: '▮', xPercent: 50, yPercent: 55, sizePercent: 25, rotation: 0 }, // House body
    { shape: '●', xPercent: 45, yPercent: 50, sizePercent: 8, rotation: 0 }   // Window
  ],
  answer: 'house',
  postTitle: 'Welcome to Shape Guess Challenge!'
};

// Redis key patterns - using centralized patterns from shared types
const getChallengeKey = (postId: string): string => {
  return REDIS_KEYS.challenge(postId);
};

const getSubredditChallengesKey = (subredditName: string): string => {
  return `challenges:${subredditName}`;
};

export const createChallenge = async (
  shapes: Shape[],
  answer: string,
  postTitle: string
): Promise<{ challenge: Challenge; postUrl: string }> => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  const username = await reddit.getCurrentUsername();
  if (!username) {
    throw new Error('User must be authenticated to create challenges');
  }

  // Create the challenge post first with custom title and creator attribution
  const fullPostTitle = `${postTitle} - Created by u/${username}`;

  const post = await reddit.submitCustomPost({
    splash: {
      appDisplayName: 'Shape Guess Challenge',
      backgroundUri: 'default-splash.png',
      buttonLabel: 'Play Challenge',
      description: `Can you solve this shape challenge?`,
      heading: `🎯 ${postTitle}`,
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameType: 'challenge',
      challengeTitle: postTitle,
    },
    subredditName: subredditName,
    title: fullPostTitle,
  });

  // Create challenge object
  const challenge: Challenge = {
    id: generateChallengeId(),
    shapes,
    answer: answer.toLowerCase().trim(),
    postTitle: postTitle.trim(),
    createdBy: username,
    createdAt: Date.now(),
    subredditName,
    postId: post.id,
  };

  // Store challenge in Redis with error handling
  const challengeKey = getChallengeKey(post.id);
  try {
    await redis.set(challengeKey, JSON.stringify(challenge));
  } catch (error) {
    console.error('Failed to store challenge in Redis:', error);
    throw new Error('Failed to save challenge data. Please try again.');
  }

  // Add to subreddit challenges list with error handling
  const subredditChallengesKey = getSubredditChallengesKey(subredditName);
  try {
    await redis.hSet(subredditChallengesKey, { [post.id]: Date.now().toString() });
  } catch (error) {
    console.error('Failed to add challenge to subreddit list:', error);
    // Challenge is already stored, so we can continue but log the error
    console.warn('Challenge created but may not appear in subreddit list immediately');
  }

  const postUrl = `https://reddit.com/r/${subredditName}/comments/${post.id}`;

  return { challenge, postUrl };
};

export const getChallenge = async (postId: string): Promise<Challenge | null> => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  const challengeKey = getChallengeKey(postId);

  let challengeData: string | undefined;
  try {
    challengeData = await redis.get(challengeKey);
  } catch (error) {
    console.error('Failed to retrieve challenge from Redis:', error);
    throw new Error('Failed to load challenge data. Please try again.');
  }

  if (!challengeData) {
    return null;
  }

  try {
    return JSON.parse(challengeData) as Challenge;
  } catch (error) {
    console.error('Error parsing challenge data:', error);
    throw new Error('Challenge data is corrupted. Please contact support.');
  }
};

export const getChallengesForSubreddit = async (): Promise<Challenge[]> => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  const subredditChallengesKey = getSubredditChallengesKey(subredditName);

  let challengeHash: Record<string, string>;
  try {
    challengeHash = await redis.hGetAll(subredditChallengesKey);
  } catch (error) {
    console.error('Failed to retrieve challenge list from Redis:', error);
    throw new Error('Failed to load challenge list. Please try again.');
  }

  // Handle case where hash doesn't exist (empty challenge list)
  if (!challengeHash || Object.keys(challengeHash).length === 0) {
    return [];
  }

  // Sort postIds by timestamp from hash values first (newest first)
  const sortedPostIds = Object.keys(challengeHash).sort((a, b) => {
    const timestampA = parseInt(challengeHash[a] || '0') || 0;
    const timestampB = parseInt(challengeHash[b] || '0') || 0;
    return timestampB - timestampA; // newest first
  });

  // Get all challenges in parallel, maintaining sorted order
  const challengePromises = sortedPostIds.map(async (postId: string) => {
    const challengeKey = getChallengeKey(postId);

    try {
      const challengeData = await redis.get(challengeKey);

      if (challengeData) {
        try {
          return JSON.parse(challengeData) as Challenge;
        } catch (parseError) {
          console.error(`Error parsing challenge data for post ${postId}:`, parseError);
          return null;
        }
      }
      return null;
    } catch (redisError) {
      console.error(`Failed to retrieve challenge data for post ${postId}:`, redisError);
      return null;
    }
  });

  let results: (Challenge | null)[];
  try {
    results = await Promise.all(challengePromises);
  } catch (error) {
    console.error('Failed to retrieve some challenge data:', error);
    throw new Error('Failed to load some challenges. Please try again.');
  }

  // Filter out null results while maintaining chronological order
  const challenges: Challenge[] = [];
  results.forEach((challenge: Challenge | null) => {
    if (challenge) {
      challenges.push(challenge);
    }
  });

  return challenges;
};

export const createDefaultChallenge = async (postId: string): Promise<Challenge> => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  if (!postId) {
    throw new Error('postId is required');
  }

  // Create challenge object with default configuration
  const challenge: Challenge = {
    id: generateChallengeId(),
    shapes: DEFAULT_CHALLENGE.shapes,
    answer: DEFAULT_CHALLENGE.answer.toLowerCase().trim(),
    postTitle: DEFAULT_CHALLENGE.postTitle.trim(),
    createdBy: 'system',
    createdAt: Date.now(),
    subredditName,
    postId,
  };

  // Store challenge in Redis with error handling
  const challengeKey = getChallengeKey(postId);
  try {
    await redis.set(challengeKey, JSON.stringify(challenge));
  } catch (error) {
    console.error('Failed to store default challenge in Redis:', error);
    throw new Error('Failed to save default challenge data. Please try again.');
  }

  // Add to subreddit challenges list with error handling
  const subredditChallengesKey = getSubredditChallengesKey(subredditName);
  try {
    await redis.hSet(subredditChallengesKey, { [postId]: Date.now().toString() });
  } catch (error) {
    console.error('Failed to add default challenge to subreddit list:', error);
    // Challenge is already stored, so we can continue but log the error
    console.warn('Default challenge created but may not appear in subreddit list immediately');
  }

  return challenge;
};

// Generate unique session ID
const generateSessionId = (): string => {
  return 'sess_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
};

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const validateGuess = (guess: string, challenge: Challenge): boolean => {
  if (!guess || !challenge || !challenge.answer) {
    return false;
  }

  // Case-insensitive matching with trimmed whitespace
  const normalizedGuess = guess.toLowerCase().trim();
  const normalizedAnswer = challenge.answer.toLowerCase().trim();

  return normalizedGuess === normalizedAnswer;
};

export const getUserSession = async (username: string, postId: string): Promise<UserSession> => {
  if (!username || !postId) {
    throw new Error('Username and postId are required');
  }

  const sessionKey = REDIS_KEYS.userSession(postId, username);

  try {
    const sessionData = await redis.get(sessionKey);

    if (sessionData) {
      const session = JSON.parse(sessionData) as UserSession;

      // Check if session has timed out
      const now = Date.now();
      if (now - session.startTime > SESSION_TIMEOUT) {
        // Session expired, create new one
        return await createNewSession(username, postId);
      }

      return session;
    } else {
      // No existing session, create new one
      return await createNewSession(username, postId);
    }
  } catch (error) {
    console.error('Failed to retrieve user session:', error);
    // If Redis fails, create a new session
    return await createNewSession(username, postId);
  }
};

const createNewSession = async (username: string, postId: string): Promise<UserSession> => {
  const session: UserSession = {
    sessionId: generateSessionId(),
    username,
    postId,
    startTime: Date.now(),
    attempts: 0,
    completed: false,
  };

  const sessionKey = REDIS_KEYS.userSession(postId, username);

  try {
    // Store session with TTL (expire after session timeout + buffer)
    await redis.set(sessionKey, JSON.stringify(session));
    await redis.expire(sessionKey, Math.ceil(SESSION_TIMEOUT / 1000) + 300); // 5 min buffer
  } catch (error) {
    console.error('Failed to store new session:', error);
    // Continue with in-memory session if Redis fails
  }

  return session;
};

export const updateSession = async (session: UserSession): Promise<UserSession> => {
  if (!session || !session.username || !session.postId) {
    throw new Error('Invalid session data');
  }

  const sessionKey = REDIS_KEYS.userSession(session.postId, session.username);

  try {
    // Update session data
    await redis.set(sessionKey, JSON.stringify(session));

    // Refresh TTL if session is still active
    if (!session.completed) {
      await redis.expire(sessionKey, Math.ceil(SESSION_TIMEOUT / 1000) + 300);
    }
  } catch (error) {
    console.error('Failed to update session:', error);
    throw new Error('Failed to save session data. Please try again.');
  }

  return session;
};

export const cleanupExpiredSessions = async (postId: string): Promise<void> => {
  // This function can be called periodically to clean up expired sessions
  // For now, we rely on Redis TTL to handle cleanup automatically
  // In the future, this could scan for expired sessions and remove them manually

  try {
    // Get all session keys for this post (this is a simplified approach)
    // In production, you might want to maintain a separate index of active sessions
    console.log(`Session cleanup for post ${postId} relies on Redis TTL`);
  } catch (error) {
    console.error('Error during session cleanup:', error);
  }
};
