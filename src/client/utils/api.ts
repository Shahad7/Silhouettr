import {
  ChallengeResponse,
  GuessSubmissionRequest,
  GuessSubmissionResponse,
  LeaderboardResponse
} from '../../shared/types/api';

// API configuration
const API_BASE_URL = '/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network connection failed') {
    super(message, undefined, true);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timed out') {
    super(message, undefined, true);
    this.name = 'TimeoutError';
  }
}

// Utility function to create timeout promise
const createTimeoutPromise = (timeout: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError()), timeout);
  });
};

// Utility function to delay execution
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Generic fetch wrapper with timeout and error handling
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await Promise.race([
      fetch(url, {
        ...options,
        signal: controller.signal,
      }),
      createTimeoutPromise(timeout),
    ]);

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new TimeoutError();
      }
      if (error.message.includes('fetch')) {
        throw new NetworkError();
      }
    }

    throw error;
  }
}

// Generic API call function with retry logic
async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        const isRetryable = response.status >= 500 || response.status === 429;

        throw new ApiError(
          `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
          response.status,
          isRetryable
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === retries || (error instanceof ApiError && !error.retryable)) {
        break;
      }

      // Wait before retrying (exponential backoff)
      const delayMs = RETRY_DELAY * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }

  throw lastError!;
}

// API functions
export const challengeApi = {
  // Get challenge data for a post
  async getChallenge(postId: string): Promise<ChallengeResponse> {
    return apiCall<ChallengeResponse>(`/challenge/${encodeURIComponent(postId)}`);
  },

  // Submit a guess for a challenge
  async submitGuess(request: GuessSubmissionRequest): Promise<GuessSubmissionResponse> {
    return apiCall<GuessSubmissionResponse>('/submit-guess', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Get leaderboard for a challenge
  async getLeaderboard(postId: string): Promise<LeaderboardResponse> {
    return apiCall<LeaderboardResponse>(`/leaderboard/${encodeURIComponent(postId)}`);
  },
};

// Hook for handling API states
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryable: boolean;
}

export function createInitialApiState<T>(): ApiState<T> {
  return {
    data: null,
    loading: false,
    error: null,
    retryable: false,
  };
}

// Utility function to handle API errors and update state
export function handleApiError(error: unknown): { error: string; retryable: boolean } {
  if (error instanceof ApiError) {
    return {
      error: error.message,
      retryable: error.retryable,
    };
  }

  if (error instanceof NetworkError) {
    return {
      error: 'Network connection failed. Please check your internet connection.',
      retryable: true,
    };
  }

  if (error instanceof TimeoutError) {
    return {
      error: 'Request timed out. Please try again.',
      retryable: true,
    };
  }

  return {
    error: error instanceof Error ? error.message : 'An unexpected error occurred',
    retryable: false,
  };
}

// Note: Network connectivity is now detected through API error responses
// rather than browser events, making it compatible with Devvit's sandboxed environment
