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
    // Extract base64 data from data URL
    const base64Data = screenshotDataUrl.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid screenshot data URL format');
    }

    // Store the base64 image data in Redis
    const screenshotKey = getScreenshotKey(postId);
    await redis.set(screenshotKey, base64Data);

    // Set expiration (optional - 30 days)
    await redis.expire(screenshotKey, 30 * 24 * 60 * 60); // 30 days in seconds

    // Return the data URL directly instead of serving via endpoint
    return `data:image/png;base64,${base64Data}`;
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
  return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADwCAYAAAC69lmVAAAAAXNSR0IArs4c6QAADWBJREFUeF7t3XmsnFUZB+ADhbTcQqBosMYIFhEqIPuSsggEglT2pdAiCpRNsJQCUm3ZtAIJQUAxGhFUlCUsSTGUuoDWC1K2lrKIlTUiYlCKUUqCKUFq5iYlGCnTmXfmzJzve+6/nfe85zzvyS+ny71dbdTozZYnXwQIEChAYDWBVcCUbJEAgSEBgeUiECBQjIDAKmZUNkqAgMByBwgQKEZAYBUzKhslQEBguQMECBQjILCKGZWNEiAgsNwBAgSKERBYxYzKRgkQEFjuAAECxQgIrGJGZaMECAgsd4AAgWIEBFYxo7JRAgQEljtAgEAxAgKrmFHZKAECAssdIECgGAGBVcyobJQAAYHlDhAgUIyAwCpmVDZKgIDAcgcIEChGQGAVMyobJUBAYLkDBAgUIyCwihmVjRIgILDcAQIEihEQWMWMykYJEBBY7gABAsUICKxiRmWjBAgILHeAAIFiBARWMaOyUQIEBJY7QIBAMQICq5hR2SgBAgLLHSBAoBgBgVXMqGyUAAGB5Q4QIFCMgMAqZlQ2SoCAwHIHCBAoRkBgFTMqGyVAQGC5AwQIFCMgsIoZlY0SICCw3AECBIoREFjFjMpGCRAQWO4AAQLFCAisYkZlowQICCx3gACBYgQEVjGjslECBASWO0CAQDECAquYUdkoAQICyx0gQKAYAYFVzKhslAABgeUOECBQjIDAKmZUNkqAgMByBwgQKEZAYBUzKhslQEBguQMECBQjILCKGZWNEiAgsNwBAgSKERBYxYzKRgkQEFjuAAECxQgIrGJGZaMECAgsd4AAgWIEBFYxo7JRAgQEljtAgEAxAgKrmFHZKAECAssdIECgGAGBVcyobJQAAYHlDhAgUIyAwCpmVDZKgIDAcgcIEChGQGAVMyobJUBAYLkDBAgUIyCwihmVjRIgILDcAQIEihEQWMWMykYJEBBY7gABAsUICKxiRmWjBAgILHeAAIFiBARWMaOyUQIEBJY7QIBAMQICq5hR2SgBAgLLHSBAoBgBgVXMqGyUAAGB5Q4QIFCMgMAqZlQ2SoCAwHIHCBAoRkBgFTMqGyVAQGC5AwQIFCMgsIoZlY0SICCw3AECBIoREFjFjKr3G91ggw+mTTfZOK237rppxIjhaenrr6clS/6RFj/1bFq2bFnvN2gHlRcQWJUfcfsHHDZsWNpj93HpkIPGp3322j2NHr3Bey721lv/SU8ufirdOfeudPsdv0h/euHF9puqJPA+AgLL9fg/gTXWGJYmHnlomjblpLTxmI1aElq+fHma+8tfpyu/fXV69PEnW6r1YQLNBARWM6Ga/fo2W22Rrrri4rTlFmNDJ28E109uuDV97aJvpqVLXw+tpZjACgGB5S68IzD52Enp0ovPS43fCnbq688vvpSOOuaU9Myzz3dqSevUWEBg1Xj47z76jOlT0zlnntYVjddeW5oOn3RiWvToE11Z36L1ERBY9Zn1Sk967DFHpisvm9VViSVLXk17j5+QXvrry13tY/FqCwisas+36em22nLzdPfPb01rrrlG089GP9B4Ye17wMT09ttvR5dSX1MBgVXTwTeOvfrqq6e77rw5bbftVtkUps/8Rrr2xzdm66dRtQQEVrXm2dJpDj90/3TN9y5vqSb64X/+67X0qe33TG+88e/oUuprKCCwajj0FUcevHt2avyWMPfXzPMvSd+/9qe52+pXAQGBVYEhtnOE7bfbOt0995Z2SsM1zz3/Qtppt/3C61igfgICq34zHzrxrAumpymnTu7Z6Xff++D0h8VP96y/xmUKCKwy5xbe9X3z7kibf3LT8DrtLjDrkivSt77zg3bL1dVUQGDVcPDDhw9Pf3luUWp8z2Cvvu6Ye1c67sSpvWqvb6ECAqvQwUW2PXazTdL9g3dGlgjXPvX0c2mXPQ8Ir2OBegkIrHrNe+i043beIc392Q09Pfkrr7yaxm69W0/3oHl5AgKrvJmFd7zHp3dJt9/yo/A6kQUa3184ZuxOkSXU1lBAYNVw6DvusE361Zybe3ryl//297TFtnv0dA+alycgsMqbWXjHG370I+mxh38TXieywKLHfp/2GT8hsoTaGgoIrBoOvfE9hC89vyiNGDGiZ6e/bfacdMqXzulZf43LFBBYZc4tvOs5s69Pu47bMbxOuwucM2NW+uF1N7Vbrq6mAgKrpoM//bQT0tfP790LZ9ud90mNn0bqi0ArAgKrFa0KffbDoz+Unlg4r6M/DnlVeR58+JH02YM/t6of9zkC7wgIrBpfhqu/e1macNiB2QU+f/yUof9ZxxeBVgUEVqtiFfr8mI9tmOYPzkkjhg/PdqqHFzyaxh98dGr8rzq+CLQqILBaFavY58+aeko6b8aZWU617M030977HZEW//GZLP00qZ6AwKreTFs6UeOfONx24zVprz13bamunQ+fNf3CdN31vfkZXO3sV03/CQis/ptJth19fMxGaWBgIA2MXCtddflF6RObbNy13jfdPDtdfe31Q+svT8uHfhaW3xZ2jbuyCwusyo62+cG+PO3UNPMrZzT/YIc/MW/wvnTEpBM7vKrl6iAgsOow5ZWccZ111h76Fp1R662bVWHfA45KCx95PGtPzaohILCqMce2T5H7leV11faoFKaUBFbNr8Haa49Mjy+Yl+2V5XVV8wsXPL7ACgJWofzsM76Yzv3qtK4fxeuq68SVbyCwKj/i5gfM9cr6zIET04KFjzXfkE8QWImAwHI1hgS6/cr67eD8dPikE2gTCAkIrBBfdYq7/cryuqrOXenlSQRWL/X7rHe3XlleV3026IK3I7AKHl6nt96tV5bXVacnVd/1BFZ9Z/+eJ+/0N0N7XblgnRQQWJ3UrMBajVdW41+/rz9qvY6cZr+DJqXGj5TxRaATAgKrE4oVW6NTr6zBe+anwyb6m8GKXY+eHkdg9ZS/P5t36pXlddWf8y15VwKr5Ol1ce/RV5bXVReHU+OlBVaNh/9+Rx85cmDoewzb/bMsrysXqxsCAqsbqhVZ88ypJ6fzZ5zV8mkG770/HXbU5JbrFBBoJiCwmgnV+NfbfWWNP+jo9NCCRTWWc/RuCQisbslWZN1WX1leVxUZfJ8eQ2D16WD6ZVutvrK8rvplctXch8Cq5lw7eqppp5+cLpjZ/M+yvK46ym6x9xAQWK5FU4HGK6vxr98/sP6o9/1s47+fb/w39L4IdEtAYHVLtmLrNntl3fO7B9KhRx5fsVM7Tr8JCKx+m0if7qfZK8vrqk8HV7FtCayKDbSbx1nZK8vrqpvq1n63gMByH1ZZYGWvLK+rVSb0waCAwAoC1q38jCknpQvPPfudY99734PpkAnH1Y3BeXskILB6BF9q24GBtYa+x3DF3xjuf8gx6YGHFpZ6HPsuTEBgFTawftjuileW11U/TKNeexBY9Zp3R0674pX1hcmne111RNQiqyogsFZVyuf+R2DXcTum+Q8soEIgq4DAysqtGQECEQGBFdFTS4BAVgGBlZVbMwIEIgICK6KnlgCBrAICKyu3ZgQIRAQEVkRPLQECWQUEVlZuzQgQiAgIrIieWgIEsgoIrKzcmhEgEBEQWBE9tQQIZBUQWFm5NSNAICIgsCJ6agkQyCogsLJya0aAQERAYEX01BIgkFVAYGXl1owAgYiAwIroqSVAIKuAwMrKrRkBAhEBgRXRU0uAQFYBgZWVWzMCBCICAiuip5YAgawCAisrt2YECEQEBFZETy0BAlkFBFZWbs0IEIgICKyInloCBLIKCKys3JoRIBAREFgRPbUECGQVEFhZuTUjQCAiILAiemoJEMgqILCycmtGgEBEQGBF9NQSIJBVQGBl5daMAIGIgMCK6KklQCCrgMDKyq0ZAQIRAYEV0VNLgEBWAYGVlVszAgQiAgIroqeWAIGsAgIrK7dmBAhEBARWRE8tAQJZBQRWVm7NCBCICAisiJ5aAgSyCgisrNyaESAQERBYET21BAhkFRBYWbk1I0AgIiCwInpqCRDIKiCwsnJrRoBAREBgRfTUEiCQVUBgZeXWjACBiIDAiuipJUAgq4DAysqtGQECEQGBFdFTS4BAVgGBlZVbMwIEIgICK6KnlgCBrAICKyu3ZgQIRAQEVkRPLQECWQUEVlZuzQgQiAgIrIieWgIEsgoIrKzcmhEgEBEQWBE9tQQIZBUQWFm5NSNAICIgsCJ6agkQyCogsLJya0aAQERAYEX01BIgkFVAYGXl1owAgYiAwIroqSVAIKuAwMrKrRkBAhEBgRXRU0uAQFYBgZWVWzMCBCICAiuip5YAgawCAisrt2YECEQEBFZETy0BAlkFBFZWbs0IEIgICKyInloCBLIKCKys3JoRIBAREFgRPbUECGQVEFhZuTUjQCAiILAiemoJEMgqILCycmtGgEBEQGBF9NQSIJBVQGBl5daMAIGIgMCK6KklQCCrgMDKyq0ZAQIRAYEV0VNLgEBWAYGVlVszAgQiAgIroqeWAIGsAgIrK7dmBAhEBARWRE8tAQJZBQRWVm7NCBCICAisiJ5aAgSyCgisrNyaESAQERBYET21BAhkFRBYWbk1I0AgIvBfNPbYHzVHitQAAAAASUVORK5CYII=`;
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
