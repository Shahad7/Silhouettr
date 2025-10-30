import { redis } from '@devvit/web/server';
import {
  REDIS_KEYS,
  LeaderboardEntry,
  LeaderboardResponse,
  UserStatsData
} from '../../shared/types/api';
import {
  calculateLeaderboardScore,
  createUserStatsData
} from './redis-schemas';

/**
 * Leaderboard Service
 * 
 * Manages user rankings and performance tracking using Redis sorted sets.
 * Implements scoring algorithm based on completion time with attempt penalties.
 */
export class LeaderboardService {

  /**
   * Record a user's challenge completion and update leaderboard
   */
  async recordCompletion(
    postId: string,
    username: string,
    completionTimeMs: number,
    attempts: number
  ): Promise<number> {
    try {
      const leaderboardKey = REDIS_KEYS.leaderboard(postId);
      const userStatsKey = REDIS_KEYS.userStats(postId, username);

      // Calculate score (lower is better)
      const score = calculateLeaderboardScore(completionTimeMs, attempts);

      // Create user stats data
      const statsData = createUserStatsData(attempts, completionTimeMs);

      // Use transaction to ensure atomicity
      const txn = await redis.watch(leaderboardKey);
      await txn.multi();

      // Add/update user in leaderboard sorted set
      await txn.zAdd(leaderboardKey, { member: username, score });

      // Store detailed user stats
      await txn.hSet(userStatsKey, {
        attempts: statsData.attempts.toString(),
        completion_time: statsData.completion_time.toString(),
        completed_at: statsData.completed_at.toString()
      });

      await txn.exec();

      // Get user's rank (0-based, so add 1 for 1-based ranking)
      const rank = await redis.zRank(leaderboardKey, username);
      return rank !== null && rank !== undefined ? rank + 1 : -1;

    } catch (error) {
      console.error('Error recording completion:', error);
      throw new Error('Failed to record completion');
    }
  }

  /**
   * Get leaderboard rankings for a specific challenge
   */
  async getLeaderboard(
    postId: string,
    limit: number = 10,
    offset: number = 0,
    page: number = 1,
    pageSize: number = 10
  ): Promise<LeaderboardResponse> {
    try {
      const leaderboardKey = REDIS_KEYS.leaderboard(postId);

      // Get total number of players
      const totalPlayers = await redis.zCard(leaderboardKey);

      // Get top players with scores (ascending order - lower scores are better)
      const topPlayers = await redis.zRange(
        leaderboardKey,
        offset,
        offset + limit - 1,
        { by: 'rank' }
      );

      // Build leaderboard entries with detailed stats
      const leaderboard: LeaderboardEntry[] = [];

      for (let i = 0; i < topPlayers.length; i++) {
        const player = topPlayers[i];
        if (!player) continue;
        const username = player.member;
        const rank = offset + i + 1;

        // Get detailed user stats
        const userStatsKey = REDIS_KEYS.userStats(postId, username);
        const stats = await redis.hGetAll(userStatsKey);

        if (stats && Object.keys(stats).length > 0) {
          leaderboard.push({
            username,
            attempts: parseInt(stats.attempts || '0') || 0,
            completionTime: parseInt(stats.completion_time || '0') || 0,
            completedAt: parseInt(stats.completed_at || '0') || 0,
            rank
          });
        }
      }

      const totalPages = Math.ceil(totalPlayers / pageSize);

      return {
        leaderboard,
        totalPlayers,
        currentPage: page,
        totalPages,
        pageSize
      };

    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw new Error('Failed to retrieve leaderboard');
    }
  }

  /**
   * Get a specific user's rank and stats for a challenge
   */
  async getUserRank(postId: string, username: string): Promise<number | null> {
    try {
      const leaderboardKey = REDIS_KEYS.leaderboard(postId);
      const rank = await redis.zRank(leaderboardKey, username);
      return rank !== null && rank !== undefined ? rank + 1 : null;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  /**
   * Get user's detailed stats for a challenge
   */
  async getUserStats(postId: string, username: string): Promise<UserStatsData | null> {
    try {
      const userStatsKey = REDIS_KEYS.userStats(postId, username);
      const stats = await redis.hGetAll(userStatsKey);

      if (!stats || Object.keys(stats).length === 0) {
        return null;
      }

      return {
        attempts: parseInt(stats.attempts || '0') || 0,
        completion_time: parseInt(stats.completion_time || '0') || 0,
        completed_at: parseInt(stats.completed_at || '0') || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  /**
   * Check if user has completed a challenge
   */
  async hasUserCompleted(postId: string, username: string): Promise<boolean> {
    try {
      const leaderboardKey = REDIS_KEYS.leaderboard(postId);
      const score = await redis.zScore(leaderboardKey, username);
      return score !== null;
    } catch (error) {
      console.error('Error checking completion status:', error);
      return false;
    }
  }

  /**
   * Remove a user from leaderboard (for testing or moderation)
   */
  async removeUser(postId: string, username: string): Promise<boolean> {
    try {
      const leaderboardKey = REDIS_KEYS.leaderboard(postId);
      const userStatsKey = REDIS_KEYS.userStats(postId, username);

      // Use transaction to ensure atomicity
      const txn = await redis.watch(leaderboardKey);
      await txn.multi();

      await txn.zRem(leaderboardKey, [username]);
      await txn.del(userStatsKey);

      await txn.exec();

      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      return false;
    }
  }

  /**
   * Get leaderboard with user's position highlighted
   */
  async getLeaderboardWithUserPosition(
    postId: string,
    username: string,
    pageSize: number = 10
  ): Promise<LeaderboardResponse> {
    try {
      // Get user's rank first
      const userRank = await this.getUserRank(postId, username);

      // Get standard leaderboard (first page)
      const leaderboardResponse = await this.getLeaderboard(postId, pageSize, 0, 1, pageSize);

      // Add user rank to response
      if (userRank !== null) {
        leaderboardResponse.userRank = userRank;
      }

      return leaderboardResponse;
    } catch (error) {
      console.error('Error getting leaderboard with user position:', error);
      throw new Error('Failed to retrieve leaderboard with user position');
    }
  }
}

// Export singleton instance
export const leaderboardService = new LeaderboardService();
