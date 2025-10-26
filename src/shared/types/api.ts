export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

// Shape Challenge Types
export type Shape = {
  shape: string;
  xPercent: number;
  yPercent: number;
  sizePercent: number;
  rotation: number;
};

export type Challenge = {
  id: string;
  shapes: Shape[];
  answer: string;
  name: string;
  createdBy: string;
  createdAt: number;
  subredditName: string;
  postId?: string;
};

export type CreateChallengeRequest = {
  shapes: Shape[];
  answer: string;
  name: string;
};

export type CreateChallengeResponse = {
  type: 'create-challenge';
  challenge: Challenge;
  postUrl: string;
};

export type GetChallengesResponse = {
  type: 'get-challenges';
  challenges: Challenge[];
};

export type ErrorResponse = {
  status: 'error';
  message: string;
  code?: string;
  retryable?: boolean;
};

// User Session Types
export interface UserSession {
  sessionId: string;
  username: string;
  postId: string;
  startTime: number;
  attempts: number;
  completed: boolean;
}

// Leaderboard Types
export interface LeaderboardEntry {
  username: string;
  attempts: number;
  completionTime: number;
  completedAt: number;
  rank: number;
}

// API Request/Response Types
export interface ChallengeResponse {
  challenge: Challenge;
  session?: UserSession;
}

export interface GuessSubmissionRequest {
  postId: string;
  guess: string;
  sessionId: string;
}

export interface GuessSubmissionResponse {
  correct: boolean;
  attempts: number;
  timeElapsed?: number;
  leaderboardPosition?: number;
  message: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank?: number;
  totalPlayers: number;
}

// Redis Key Patterns and Schemas
export const REDIS_KEYS = {
  // Challenge data: challenge:{postId}
  challenge: (postId: string) => `challenge:${postId}`,
  
  // User sessions: session:{postId}:{username}
  userSession: (postId: string, username: string) => `session:${postId}:${username}`,
  
  // Leaderboard sorted set: leaderboard:{postId}
  leaderboard: (postId: string) => `leaderboard:${postId}`,
  
  // User performance data: user_stats:{postId}:{username}
  userStats: (postId: string, username: string) => `user_stats:${postId}:${username}`,
} as const;

// Redis Data Schemas
export interface UserStatsData {
  attempts: number;
  completion_time: number;
  completed_at: number;
}
