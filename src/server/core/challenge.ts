import { context, reddit, redis } from '@devvit/web/server';
import { Challenge, Shape, REDIS_KEYS, UserSession } from '../../shared/types/api';

// Generate unique challenge ID
const generateChallengeId = (): string => {
  return '_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
};

// Screenshot storage functions
const getScreenshotKey = (postId: string): string => {
  return `screenshot:${postId}`;
};

const storeScreenshot = async (postId: string, screenshotDataUrl: string): Promise<string> => {
  try {
    // Store the complete data URL (supports both PNG and SVG)
    const screenshotKey = getScreenshotKey(postId);
    await redis.set(screenshotKey, screenshotDataUrl);

    // Set expiration (optional - 30 days)
    await redis.expire(screenshotKey, 30 * 24 * 60 * 60); // 30 days in seconds

    // Return the data URL directly
    return screenshotDataUrl;
  } catch (error) {
    console.error('Failed to store screenshot in Redis:', error);
    throw new Error('Failed to store screenshot');
  }
};

export const getScreenshot = async (postId: string): Promise<string | null> => {
  try {
    const screenshotKey = getScreenshotKey(postId);
    const base64Data = await redis.get(screenshotKey);

    if (!base64Data) {
      return null;
    }

    // Return as data URL
    return `data:image/png;base64,${base64Data}`;
  } catch (error) {
    console.error('Failed to retrieve screenshot from Redis:', error);
    return null;
  }
};

// Default challenge configuration - now uses a pre-generated data URL
const DEFAULT_CHALLENGE_SHAPES = [
  { shape: '▲', xPercent: 50, yPercent: 25, sizePercent: 18, rotation: 0 }, // Roof
  { shape: '▮', xPercent: 50, yPercent: 55, sizePercent: 25, rotation: 0 }, // House body
  { shape: '●', xPercent: 45, yPercent: 50, sizePercent: 8, rotation: 0 }   // Window
];

// Generate a data URL for the default challenge (icecream shape)
const generateDefaultChallengeDataUrl = (): string => {
  // Using the provided icecream challenge data URL
  return `data:image/png;base64,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`;
};

const DEFAULT_CHALLENGE: Omit<Challenge, 'id' | 'createdAt' | 'postId' | 'createdBy' | 'subredditName'> = {
  shapes: DEFAULT_CHALLENGE_SHAPES,
  answer: 'icecream',
  postTitle: 'Welcome to Shape Guess Challenge!',
  screenshotUrl: generateDefaultChallengeDataUrl()
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
  postTitle: string,
  screenshotDataUrl?: string
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
      appDisplayName: 'Silhouettr',
      backgroundUri: 'shape-challenge-splash.png',
      buttonLabel: 'Play Challenge',
      description: `Can you guess what this picture represents?`,
      heading: '🎯 Welcome to Silhouettr!',
      appIconUri: 'shape-challenge-logo.png',
    },
    postData: {
      gameType: 'challenge',
      challengeTitle: postTitle,
    },
    subredditName: subredditName,
    title: fullPostTitle,
  });

  // Store screenshot if provided
  let screenshotUrl: string | undefined;
  if (screenshotDataUrl) {
    console.log('Server: Processing screenshot, data length:', screenshotDataUrl.length);
    try {
      screenshotUrl = await storeScreenshot(post.id, screenshotDataUrl);
      console.log('Server: Screenshot stored successfully');
    } catch (error) {
      console.error('Failed to store screenshot:', error);
      // Continue without screenshot - fallback to shape rendering
    }
  }

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
    ...(screenshotUrl && { screenshotUrl }),
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
    screenshotUrl: DEFAULT_CHALLENGE.screenshotUrl || generateDefaultChallengeDataUrl(),
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
