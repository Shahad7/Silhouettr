# Design Document

## Overview

This design addresses the Redis syntax issues in the challenge system by replacing unsupported Redis set operations (`sadd`, `smembers`) with supported Devvit Redis API operations. The solution will use Redis hash operations to maintain challenge lists while preserving all existing functionality.

## Architecture

### Current Issues
- Using `redis.sadd()` and `redis.smembers()` which don't exist in Devvit Redis API
- Using deprecated `substr()` method
- Missing TypeScript types for function parameters

### Proposed Solution
- Replace set operations with Redis hash operations (`hSet`, `hGetAll`, `hKeys`)
- Use Redis hash to store subreddit challenge mappings
- Implement proper TypeScript typing
- Replace deprecated methods with modern alternatives

## Components and Interfaces

### Redis Key Structure

**Current Structure:**
```
challenges:{subredditName} -> Set of postIds
challenge:{subredditName}:{postId} -> Challenge JSON
```

**New Structure:**
```
challenges:{subredditName} -> Hash { postId: timestamp }
challenge:{subredditName}:{postId} -> Challenge JSON (unchanged)
```

### Modified Functions

#### 1. createChallenge()
- Replace `redis.sadd()` with `redis.hSet()`
- Store postId as hash field with timestamp as value for sorting

#### 2. getChallengesForSubreddit()
- Replace `redis.smembers()` with `redis.hGetAll()`
- Sort challenges by timestamp from hash values
- Maintain chronological ordering

#### 3. generateChallengeId()
- Replace `substr()` with `substring()` or `slice()`
- Maintain same ID generation logic

## Data Models

### Challenge Hash Entry
```typescript
// Hash field: postId
// Hash value: timestamp (string)
{
  [postId: string]: string; // timestamp
}
```

### Challenge Object (unchanged)
```typescript
interface Challenge {
  id: string;
  shapes: Shape[];
  answer: string;
  name: string;
  createdBy: string;
  createdAt: number;
  subredditName: string;
  postId: string;
}
```

## Error Handling

### Redis Operation Failures
- Wrap Redis operations in try-catch blocks
- Provide meaningful error messages for hash operation failures
- Handle cases where hash doesn't exist (empty challenge list)

### Data Consistency
- Ensure challenge creation is atomic where possible
- Handle partial failures gracefully
- Maintain data integrity between individual challenge storage and subreddit listing

## Testing Strategy

### Unit Tests (Optional)
- Test Redis hash operations with mock data
- Verify challenge retrieval and sorting logic
- Test error handling for missing data

### Integration Tests (Optional)
- Test full challenge creation and retrieval flow
- Verify Redis operations work with actual Devvit Redis instance
- Test performance with multiple challenges

## Implementation Details

### Redis Hash Operations
```typescript
// Adding challenge to subreddit list
await redis.hSet(subredditChallengesKey, postId, Date.now().toString());

// Getting all challenges for subreddit
const challengeHash = await redis.hGetAll(subredditChallengesKey);
const postIds = Object.keys(challengeHash);

// Sorting by timestamp
const sortedPostIds = postIds.sort((a, b) => {
  const timestampA = parseInt(challengeHash[a]);
  const timestampB = parseInt(challengeHash[b]);
  return timestampB - timestampA; // newest first
});
```

### TypeScript Improvements
```typescript
// Add proper typing for parameters
const challengePromises = postIds.map(async (postId: string) => {
  // ... implementation
});

// Replace deprecated substr
const id = '_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
```

## Performance Considerations

### Redis Operations
- Hash operations (`hSet`, `hGetAll`) are efficient for the expected data size
- Single hash per subreddit scales well for typical subreddit challenge counts
- Batch retrieval of challenges maintains good performance

### Memory Usage
- Hash storage is memory-efficient for challenge listings
- Individual challenge storage remains unchanged
- No significant memory overhead from the new approach

## Migration Strategy

### Backward Compatibility
- New hash-based storage will work alongside existing individual challenge storage
- No data migration needed for existing challenges
- Subreddit challenge lists will be rebuilt as new challenges are created

### Deployment
- Changes are backward compatible
- No special deployment steps required
- Existing challenges remain accessible
