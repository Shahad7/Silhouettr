import express from 'express';
import { ChallengeResponse, ErrorResponse, GuessSubmissionRequest, GuessSubmissionResponse, LeaderboardResponse, CreateChallengeRequest, CreateChallengeResponse, GetChallengesResponse } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import { getChallenge, validateGuess, getUserSession, updateSession, createChallenge, getChallengesForSubreddit } from './core/challenge';
import { leaderboardService } from './core/leaderboard';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

// Trust proxy for rate limiting (if behind a proxy)
app.set('trust proxy', 1);

const router = express.Router();

// router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
//   '/api/init',
//   async (_req, res): Promise<void> => {
//     const { postId } = context;

//     if (!postId) {
//       console.error('API Init Error: postId not found in devvit context');
//       res.status(400).json({
//         status: 'error',
//         message: 'postId is required but missing from context',
//       });
//       return;
//     }

//     try {
//       const [count, username] = await Promise.all([
//         redis.get('count'),
//         reddit.getCurrentUsername(),
//       ]);

//       res.json({
//         type: 'init',
//         postId: postId,
//         count: count ? parseInt(count) : 0,
//         username: username ?? 'anonymous',
//       });
//     } catch (error) {
//       console.error(`API Init Error for post ${postId}:`, error);
//       let errorMessage = 'Unknown error during initialization';
//       if (error instanceof Error) {
//         errorMessage = `Initialization failed: ${error.message}`;
//       }
//       res.status(400).json({ status: 'error', message: errorMessage });
//     }
//   }
// );

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Health check endpoint
router.get('/api/health', async (_req, res): Promise<void> => {
  try {
    // Simple health check - just verify we can access Redis
    await redis.get('health_check');

    res.status(200).json({
      status: 'healthy',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: Date.now(),
      error: 'Health check failed',
    });
  }
});

// Challenge creation endpoint
router.post<{}, CreateChallengeResponse | ErrorResponse, CreateChallengeRequest>(
  '/api/create-challenge',
  async (req, res): Promise<void> => {
    const { shapes, answer, postTitle } = req.body;

    // Validate request data
    if (!shapes || !Array.isArray(shapes) || shapes.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'shapes array is required and must not be empty',
        code: 'INVALID_SHAPES',
        retryable: false,
      });
      return;
    }

    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'answer is required and must be a non-empty string',
        code: 'INVALID_ANSWER',
        retryable: false,
      });
      return;
    }

    if (!postTitle || typeof postTitle !== 'string' || postTitle.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'postTitle is required and must be a non-empty string',
        code: 'INVALID_POST_TITLE',
        retryable: false,
      });
      return;
    }

    // Validate shapes structure
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (!shape) {
        res.status(400).json({
          status: 'error',
          message: `Shape ${i + 1}: shape object is required`,
          code: 'INVALID_SHAPE_OBJECT',
          retryable: false,
        });
        return;
      }

      if (!shape.shape || typeof shape.shape !== 'string') {
        res.status(400).json({
          status: 'error',
          message: `Shape ${i + 1}: shape type is required`,
          code: 'INVALID_SHAPE_TYPE',
          retryable: false,
        });
        return;
      }

      if (typeof shape.xPercent !== 'number' || shape.xPercent < 0 || shape.xPercent > 100) {
        res.status(400).json({
          status: 'error',
          message: `Shape ${i + 1}: xPercent must be a number between 0 and 100`,
          code: 'INVALID_X_PERCENT',
          retryable: false,
        });
        return;
      }

      if (typeof shape.yPercent !== 'number' || shape.yPercent < 0 || shape.yPercent > 100) {
        res.status(400).json({
          status: 'error',
          message: `Shape ${i + 1}: yPercent must be a number between 0 and 100`,
          code: 'INVALID_Y_PERCENT',
          retryable: false,
        });
        return;
      }

      if (typeof shape.sizePercent !== 'number' || shape.sizePercent <= 0 || shape.sizePercent > 100) {
        res.status(400).json({
          status: 'error',
          message: `Shape ${i + 1}: sizePercent must be a number between 0 and 100`,
          code: 'INVALID_SIZE_PERCENT',
          retryable: false,
        });
        return;
      }

      if (typeof shape.rotation !== 'number') {
        res.status(400).json({
          status: 'error',
          message: `Shape ${i + 1}: rotation must be a number`,
          code: 'INVALID_ROTATION',
          retryable: false,
        });
        return;
      }
    }

    try {
      // Get current user
      const username = await reddit.getCurrentUsername();
      if (!username) {
        res.status(401).json({
          status: 'error',
          message: 'User authentication required to create challenges',
          code: 'AUTH_REQUIRED',
          retryable: false,
        });
        return;
      }

      // Create the challenge
      const { challenge, postUrl } = await createChallenge(shapes, answer, postTitle);

      res.status(201).json({
        type: 'create-challenge',
        challenge,
        postUrl,
      });
    } catch (error) {
      console.error('Error creating challenge:', error);

      let errorMessage = 'Failed to create challenge';
      const errorCode = 'CHALLENGE_CREATION_ERROR';
      let retryable = true;

      if (error instanceof Error) {
        errorMessage = error.message;
        // Determine if error is retryable based on message
        if (error.message.includes('authentication') || error.message.includes('permission')) {
          retryable = false;
        }
      }

      res.status(500).json({
        status: 'error',
        message: errorMessage,
        code: errorCode,
        retryable,
      });
    }
  }
);

// Get all challenges for subreddit endpoint
router.get<{}, GetChallengesResponse | ErrorResponse>(
  '/api/challenges',
  async (_req, res): Promise<void> => {
    try {
      // Get all challenges for the current subreddit
      const challenges = await getChallengesForSubreddit();

      res.json({
        type: 'get-challenges',
        challenges,
      });
    } catch (error) {
      console.error('Error retrieving challenges:', error);

      let errorMessage = 'Failed to retrieve challenges';
      const errorCode = 'CHALLENGES_RETRIEVAL_ERROR';
      let retryable = true;

      if (error instanceof Error) {
        errorMessage = error.message;
        // Determine if error is retryable based on message
        if (error.message.includes('subredditName') || error.message.includes('corrupted')) {
          retryable = false;
        }
      }

      res.status(500).json({
        status: 'error',
        message: errorMessage,
        code: errorCode,
        retryable,
      });
    }
  }
);

// Challenge retrieval endpoint
router.get<{ postId: string }, ChallengeResponse | ErrorResponse>(
  '/api/challenge/:postId',
  async (req, res): Promise<void> => {
    const { postId } = req.params;

    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
        code: 'MISSING_POST_ID',
        retryable: false,
      });
      return;
    }

    try {
      // Get current user
      const username = await reddit.getCurrentUsername();
      if (!username) {
        res.status(401).json({
          status: 'error',
          message: 'User authentication required',
          code: 'AUTH_REQUIRED',
          retryable: false,
        });
        return;
      }

      // Retrieve challenge data
      const challenge = await getChallenge(postId);
      if (!challenge) {
        res.status(404).json({
          status: 'error',
          message: 'Challenge not found',
          code: 'CHALLENGE_NOT_FOUND',
          retryable: false,
        });
        return;
      }

      // Get or create user session
      const session = await getUserSession(username, postId);

      res.json({
        challenge,
        session,
      });
    } catch (error) {
      console.error(`Error retrieving challenge ${postId}:`, error);

      let errorMessage = 'Failed to retrieve challenge';
      const errorCode = 'CHALLENGE_RETRIEVAL_ERROR';
      let retryable = true;

      if (error instanceof Error) {
        errorMessage = error.message;
        // Determine if error is retryable based on message
        if (error.message.includes('corrupted') || error.message.includes('authentication')) {
          retryable = false;
        }
      }

      res.status(500).json({
        status: 'error',
        message: errorMessage,
        code: errorCode,
        retryable,
      });
    }
  }
);

// Guess submission endpoint
router.post<{}, GuessSubmissionResponse | ErrorResponse, GuessSubmissionRequest>(
  '/api/submit-guess',
  async (req, res): Promise<void> => {
    const { postId, guess, sessionId } = req.body;

    // Validate request data
    if (!postId || !guess || !sessionId) {
      res.status(400).json({
        status: 'error',
        message: 'postId, guess, and sessionId are required',
        code: 'MISSING_REQUIRED_FIELDS',
        retryable: false,
      });
      return;
    }

    try {
      // Get current user
      const username = await reddit.getCurrentUsername();
      if (!username) {
        res.status(401).json({
          status: 'error',
          message: 'User authentication required',
          code: 'AUTH_REQUIRED',
          retryable: false,
        });
        return;
      }

      // Get challenge data
      const challenge = await getChallenge(postId);
      if (!challenge) {
        res.status(404).json({
          status: 'error',
          message: 'Challenge not found',
          code: 'CHALLENGE_NOT_FOUND',
          retryable: false,
        });
        return;
      }

      // Get user session and validate sessionId
      const session = await getUserSession(username, postId);
      if (!session || session.sessionId !== sessionId) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid or expired session',
          code: 'INVALID_SESSION',
          retryable: false,
        });
        return;
      }

      // Check if user has already completed this challenge
      if (session.completed) {
        res.status(400).json({
          status: 'error',
          message: 'Challenge already completed',
          code: 'ALREADY_COMPLETED',
          retryable: false,
        });
        return;
      }

      // Increment attempts
      session.attempts += 1;
      const updatedSession = await updateSession(session);

      // Validate guess
      const isCorrect = validateGuess(guess, challenge);
      const elapsedTime = Date.now() - updatedSession.startTime;

      if (isCorrect) {
        // Mark session as completed
        updatedSession.completed = true;
        await updateSession(updatedSession);

        // Record completion in leaderboard
        const leaderboardPosition = await leaderboardService.recordCompletion(
          postId,
          username,
          elapsedTime,
          updatedSession.attempts
        );

        res.json({
          correct: true,
          attempts: updatedSession.attempts,
          timeElapsed: elapsedTime,
          leaderboardPosition,
          message: 'Congratulations! You solved the challenge!',
        });
      } else {
        res.json({
          correct: false,
          attempts: updatedSession.attempts,
          message: 'Incorrect guess. Try again!',
        });
      }
    } catch (error) {
      console.error(`Error processing guess submission for post ${postId}:`, error);

      let errorMessage = 'Failed to process guess submission';
      const errorCode = 'GUESS_SUBMISSION_ERROR';
      let retryable = true;

      if (error instanceof Error) {
        errorMessage = error.message;
        // Determine if error is retryable based on message
        if (error.message.includes('corrupted') || error.message.includes('authentication')) {
          retryable = false;
        }
      }

      res.status(500).json({
        status: 'error',
        message: errorMessage,
        code: errorCode,
        retryable,
      });
    }
  }
);

// Leaderboard retrieval endpoint
router.get<{ postId: string }, LeaderboardResponse | ErrorResponse>(
  '/api/leaderboard/:postId',
  async (req, res): Promise<void> => {
    const { postId } = req.params;
    const { limit = '10', offset = '0' } = req.query;

    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
        code: 'MISSING_POST_ID',
        retryable: false,
      });
      return;
    }

    try {
      // Parse query parameters
      const limitNum = Math.min(Math.max(parseInt(limit as string) || 10, 1), 100); // Max 100 entries
      const offsetNum = Math.max(parseInt(offset as string) || 0, 0);

      // Get current user (optional for leaderboard viewing)
      const username = await reddit.getCurrentUsername();

      // Verify challenge exists
      const challenge = await getChallenge(postId);
      if (!challenge) {
        res.status(404).json({
          status: 'error',
          message: 'Challenge not found',
          code: 'CHALLENGE_NOT_FOUND',
          retryable: false,
        });
        return;
      }

      // Get leaderboard data
      let leaderboardResponse: LeaderboardResponse;

      if (username) {
        // Get leaderboard with user's position highlighted
        leaderboardResponse = await leaderboardService.getLeaderboardWithUserPosition(
          postId,
          username,
          limitNum
        );
      } else {
        // Get standard leaderboard
        leaderboardResponse = await leaderboardService.getLeaderboard(
          postId,
          limitNum,
          offsetNum
        );
      }

      res.json(leaderboardResponse);
    } catch (error) {
      console.error(`Error retrieving leaderboard for post ${postId}:`, error);

      let errorMessage = 'Failed to retrieve leaderboard';
      const errorCode = 'LEADERBOARD_RETRIEVAL_ERROR';
      let retryable = true;

      if (error instanceof Error) {
        errorMessage = error.message;
        // Determine if error is retryable based on message
        if (error.message.includes('corrupted') || error.message.includes('not found')) {
          retryable = false;
        }
      }

      res.status(500).json({
        status: 'error',
        message: errorMessage,
        code: errorCode,
        retryable,
      });
    }
  }
);

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
