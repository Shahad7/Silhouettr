import { UserSession, UserStatsData } from '../../shared/types/api';

/**
 * Redis Data Schema Documentation and Helper Functions
 * 
 * This file documents the Redis data structures used by the challenge system
 * and provides helper functions for consistent data access patterns.
 */

// ============================================================================
// DATA SCHEMA DOCUMENTATION
// ============================================================================

/**
 * Challenge Data Schema:
 * Key: challenge:{postId}
 * Type: String (JSON)
 * Value: Challenge object
 * TTL: None (persistent - challenges are permanent)
 * 
 * Example:
 * challenge:abc123 -> '{"id":"ch_123","shapes":[...],"answer":"house",...}'
 */

/**
 * User Session Schema:
 * Key: session:{postId}:{username}
 * Type: String (JSON)
 * Value: UserSession object
 * TTL: 24 hours (86400 seconds - longer for persistent storage)
 * 
 * Example:
 * session:abc123:user1 -> '{"sessionId":"sess_456","username":"user1",...}'
 */

/**
 * Leaderboard Schema:
 * Key: leaderboard:{postId}
 * Type: Sorted Set
 * Score: completion_time_ms + (attempts * 1000) - lower is better
 * Member: username
 * TTL: None (persistent - leaderboards are permanent)
 * 
 * Example:
 * leaderboard:abc123 -> {user1: 15500, user2: 23200, user3: 31100}
 */

/**
 * User Stats Schema:
 * Key: user_stats:{postId}:{username}
 * Type: Hash
 * Fields: attempts, completion_time, completed_at
 * TTL: None (persistent - user achievements are permanent)
 * 
 * Example:
 * user_stats:abc123:user1 -> {attempts: 3, completion_time: 15500, completed_at: 1640995200}
 */

/**
 * Subreddit Challenges Index Schema:
 * Key: challenges:{subredditName}
 * Type: Hash
 * Fields: postId -> timestamp
 * TTL: None (persistent - challenge index is permanent)
 * 
 * Example:
 * challenges:mysubreddit -> {post1: 1640995200, post2: 1640995300}
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate leaderboard score for a user
 * Lower scores are better (faster completion with fewer attempts)
 */
export const calculateLeaderboardScore = (completionTimeMs: number, attempts: number): number => {
  // Base score is completion time, with penalty for additional attempts
  // Each additional attempt adds 1 second penalty
  return completionTimeMs + (attempts * 1000);
};

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  return 'sess_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
};

/**
 * Session TTL in seconds (24 hours - longer since we're using Redis as persistent storage)
 */
export const SESSION_TTL = 86400;

/**
 * Create user stats data object
 */
export const createUserStatsData = (
  attempts: number,
  completionTimeMs: number,
  completedAt: number = Date.now()
): UserStatsData => ({
  attempts,
  completion_time: completionTimeMs,
  completed_at: completedAt,
});

/**
 * Validate session data
 */
export const isValidSession = (session: UserSession): boolean => {
  return !!(
    session.sessionId &&
    session.username &&
    session.postId &&
    typeof session.startTime === 'number' &&
    typeof session.attempts === 'number' &&
    typeof session.completed === 'boolean'
  );
};

/**
 * Check if session has expired (older than 24 hours)
 */
export const isSessionExpired = (session: UserSession): boolean => {
  const now = Date.now();
  const sessionAge = now - session.startTime;
  return sessionAge > (SESSION_TTL * 1000);
};
