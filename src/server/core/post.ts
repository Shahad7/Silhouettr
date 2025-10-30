import { context, reddit } from '@devvit/web/server';
import { createDefaultChallenge } from './challenge.js';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  // Create the post first
  const post = await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: 'Silhouettr',
      backgroundUri: 'shape-challenge-splash.png',
      buttonLabel: 'Play Challenge',
      description: 'Can you guess what this picture represents?',
      heading: '🎯 Welcome to Silhouettr!',
      appIconUri: 'shape-challenge-logo.png',
    },
    postData: {
      gameType: 'challenge',
      challengeTitle: 'Welcome to Shape Guess Challenge!',
      hasDefaultChallenge: true,
    },
    subredditName: subredditName,
    title: 'Welcome to Shape Guess Challenge! - Created by u/system',
  });

  // Create and store default challenge with retry logic
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      await createDefaultChallenge(post.id);
      break; // Success, exit retry loop
    } catch (error) {
      retryCount++;
      console.error(`Failed to create default challenge (attempt ${retryCount}/${maxRetries}):`, error);

      if (retryCount >= maxRetries) {
        console.error('Max retries reached for default challenge creation');
        throw new Error('Failed to create default challenge after multiple attempts. Please try again.');
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }

  return post;
};
