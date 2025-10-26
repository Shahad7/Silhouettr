import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChallengeView } from './ChallengeView';
import { challengeApi } from '../utils/api';
import type { Challenge, UserSession, GuessSubmissionResponse } from '../../shared/types/api';

// Mock the API module
vi.mock('../utils/api', () => ({
  challengeApi: {
    getChallenge: vi.fn(),
    submitGuess: vi.fn(),
  },
  handleApiError: vi.fn(),
  isOnline: vi.fn(() => true),
  addOfflineListener: vi.fn(() => () => {}),
}));

describe('ChallengeView', () => {
  const mockChallenge: Challenge = {
    id: 'test-challenge',
    shapes: [
      {
        shape: '●',
        xPercent: 50,
        yPercent: 50,
        sizePercent: 20,
        rotation: 0,
      },
    ],
    answer: 'circle',
    name: 'Test Challenge',
    createdBy: 'testuser',
    createdAt: Date.now(),
    subredditName: 'testsubreddit',
    postId: 'test-post',
  };

  const mockSession: UserSession = {
    sessionId: 'test-session',
    username: 'testuser',
    postId: 'test-post',
    startTime: Date.now(),
    attempts: 0,
    completed: false,
  };

  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(challengeApi.getChallenge).mockResolvedValue({
      challenge: mockChallenge,
      session: mockSession,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render loading state initially', () => {
    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    expect(screen.getByText('Loading challenge...')).toBeInTheDocument();
  });

  it('should load and display challenge data', async () => {
    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    });

    expect(challengeApi.getChallenge).toHaveBeenCalledWith('test-post');
    expect(screen.getByPlaceholderText('What do you see in the shapes?')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('Failed to load challenge');
    vi.mocked(challengeApi.getChallenge).mockRejectedValue(mockError);

    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load challenge')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should handle guess submission', async () => {
    const mockSubmissionResponse: GuessSubmissionResponse = {
      correct: false,
      attempts: 1,
      message: 'Try again',
    };

    vi.mocked(challengeApi.submitGuess).mockResolvedValue(mockSubmissionResponse);

    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What do you see in the shapes?');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(input, { target: { value: 'wrong answer' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(challengeApi.submitGuess).toHaveBeenCalledWith({
        postId: 'test-post',
        guess: 'wrong answer',
        sessionId: 'test-session',
      });
    });
  });

  it('should handle correct guess and show completion state', async () => {
    const mockSubmissionResponse: GuessSubmissionResponse = {
      correct: true,
      attempts: 3,
      timeElapsed: 45,
      leaderboardPosition: 5,
      message: 'Correct!',
    };

    vi.mocked(challengeApi.submitGuess).mockResolvedValue(mockSubmissionResponse);

    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What do you see in the shapes?');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(input, { target: { value: 'circle' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
    });

    expect(screen.getByText('You solved the challenge!')).toBeInTheDocument();
    expect(screen.getByText('Play Again')).toBeInTheDocument();
  });

  it('should disable input when offline', async () => {
    const { isOnline } = await import('../utils/api');
    vi.mocked(isOnline).mockReturnValue(false);

    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Offline - cannot submit');
    const submitButton = screen.getByText('Offline');

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should call onBack when back button is clicked', async () => {
    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    });

    const backButton = screen.getByText('← Back');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should render shapes on canvas', async () => {
    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    });

    const canvas = screen.getByRole('img', { hidden: true }); // Canvas has implicit img role
    expect(canvas).toBeInTheDocument();
  });

  it('should handle retry functionality', async () => {
    const mockError = new Error('Network error');
    vi.mocked(challengeApi.getChallenge)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({
        challenge: mockChallenge,
        session: mockSession,
      });

    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    });

    expect(challengeApi.getChallenge).toHaveBeenCalledTimes(2);
  });

  it('should prevent submission with empty guess', async () => {
    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit');
    expect(submitButton).toBeDisabled();

    const input = screen.getByPlaceholderText('What do you see in the shapes?');
    fireEvent.change(input, { target: { value: '   ' } }); // Only whitespace

    expect(submitButton).toBeDisabled();
  });

  it('should show submitting state during guess submission', async () => {
    let resolveSubmission: (value: GuessSubmissionResponse) => void;
    const submissionPromise = new Promise<GuessSubmissionResponse>((resolve) => {
      resolveSubmission = resolve;
    });

    vi.mocked(challengeApi.submitGuess).mockReturnValue(submissionPromise);

    render(<ChallengeView postId="test-post" onBack={mockOnBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What do you see in the shapes?');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(input, { target: { value: 'test guess' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(input).toBeDisabled();

    // Resolve the promise
    resolveSubmission!({
      correct: false,
      attempts: 1,
      message: 'Try again',
    });

    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });
});
