# Requirements Document

## Introduction

This feature integrates the existing challenge system with the Devvit Reddit game, enabling users to play shape-based challenges, submit guesses, and compete on leaderboards. The system ensures every subreddit has a default challenge available and tracks user performance metrics.

## Glossary

- **Challenge_System**: The core game logic that manages shape-based puzzles and validation
- **Reddit_App**: The Devvit application running within Reddit posts
- **Leaderboard_Service**: Component that tracks and displays user performance rankings
- **Default_Challenge**: A pre-configured challenge created automatically on app installation
- **User_Session**: A single attempt by a user to solve a challenge
- **Performance_Metrics**: Data including attempt count, completion time, and success status

## Requirements

### Requirement 1

**User Story:** As a subreddit moderator, I want a default challenge to be automatically created when the app is installed, so that users can immediately start playing without manual setup.

#### Acceptance Criteria

1. WHEN the app is installed on a subreddit, THE Challenge_System SHALL create a default challenge with predefined shapes and target configuration
2. THE Challenge_System SHALL store the default challenge data in Redis using the postId as the key
3. THE Challenge_System SHALL ensure the default challenge is immediately playable without additional configuration
4. IF challenge creation fails during installation, THEN THE Challenge_System SHALL log the error and retry the creation process

### Requirement 2

**User Story:** As a Reddit user, I want to view and interact with challenges through proper API endpoints, so that I can play the game seamlessly within the Reddit interface.

#### Acceptance Criteria

1. THE Reddit_App SHALL expose API endpoints starting with `/api/` for all challenge operations
2. WHEN a user requests challenge data, THE Challenge_System SHALL return the challenge configuration through `/api/challenge/:postId`
3. THE Challenge_System SHALL validate that the requested postId exists before returning challenge data
4. THE Reddit_App SHALL handle authentication automatically through Devvit middleware

### Requirement 3

**User Story:** As a Reddit user, I want to submit my guesses and receive immediate validation feedback, so that I can know if my solution is correct.

#### Acceptance Criteria

1. WHEN a user submits a guess, THE Challenge_System SHALL validate the guess against the target configuration
2. THE Challenge_System SHALL return validation results including success status and feedback through `/api/submit-guess`
3. THE Challenge_System SHALL increment the attempt counter for each guess submission
4. IF the guess is correct, THEN THE Challenge_System SHALL record the completion time and total attempts

### Requirement 4

**User Story:** As a Reddit user, I want to see my performance metrics including attempts and time taken, so that I can track my progress and improvement.

#### Acceptance Criteria

1. THE Reddit_App SHALL display a timer showing elapsed time during challenge attempts
2. THE Reddit_App SHALL display the current number of attempts made by the user
3. THE Performance_Metrics SHALL be updated in real-time as the user interacts with the challenge
4. WHEN a challenge is completed, THE Challenge_System SHALL store the final metrics in Redis

### Requirement 5

**User Story:** As a Reddit user, I want to view leaderboards for each challenge post, so that I can see how my performance compares to other users.

#### Acceptance Criteria

1. THE Leaderboard_Service SHALL maintain rankings for each postId separately
2. THE Leaderboard_Service SHALL store user performance data using username and postId as composite keys
3. WHEN a user completes a challenge, THE Leaderboard_Service SHALL update the rankings automatically
4. THE Reddit_App SHALL display leaderboard data through `/api/leaderboard/:postId` endpoint
5. THE Leaderboard_Service SHALL rank users by completion time with attempt count as a tiebreaker

### Requirement 6

**User Story:** As a Reddit user, I want the client interface to properly display challenges and handle my interactions, so that I can play the game intuitively.

#### Acceptance Criteria

1. THE Reddit_App SHALL fetch and display challenge data when the user clicks "Play challenge"
2. THE Reddit_App SHALL provide interactive elements for users to manipulate shapes and submit guesses
3. THE Reddit_App SHALL show real-time feedback for user actions including timer and attempt counter
4. THE Reddit_App SHALL handle network errors gracefully and provide clear error messages to users
