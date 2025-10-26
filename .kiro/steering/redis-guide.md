You can add a database to your app to store and retrieve data. The Redis plugin is designed to be fast, scalable, and secure. It supports a subset of the full Redis API, including:

Transactions for things like counting votes atomically in polls
String operations for persisting information
Number operations for incrementing numbers
Sorted sets for creating leaderboards
Hashes for managing a collection of key-value pairs
Bitfields for efficient operation on sequences of bits
Each app version installed on a subreddit is namespaced, which means Redis data is siloed from other subreddits. Keep in mind that there won’t be a single source of truth for all installations of your app, since each app installation can only access the data that it has stored in the Redis database.

Limits and quotas
Max commands per second: 1000
Max request size: 5 MB
Max storage: 500 MB
All limits are applied at a per-installation granularity.

Examples
Menu actions
Devvit Web
Devvit Blocks / Mod Tools
devvit.json
{
  "menuActions": [
    {
    "label": "Redis Test",
    "endpoint": "/internal/menu/redis-test",
    "forUserType": "moderator",
    "location": "subreddit"
    }
  ]
}

server/index.ts
// Assumes Express.js
import { redis } from '@devvit/redis';
router.post("/internal/menu/redis-test", async (_req, res: Response<UiResponse>) => {
  const key = 'hello';
  await redis.set(key, 'world');
  const value = await redis.get(key);
  console.log(`${key}: ${value}`);
});


Games
You can take a look at this Game Template to see a basic implementation of Redis in a game built with Phaser.JS

Supported Redis commands
note
Not all Redis features are supported. If you would like to request a specific Redis feature, please reach out to our team via modmail or Discord.

For all examples below, we assume that you already have obtained a Redis Client. Here's how to obtain a Redis Client for Devvit Web, Devvit Blocks and Mod Tools:

Devvit Web
Devvit Blocks / Mod Tools
devvit.json
{
  "permissions": {
    "redis": true
  }
}

server/index.ts
import { redis } from '@devvit/redis';

Simple read/write
Command	Action
get	Gets the value of key.
set	Sets key to hold a string value.
exists	Returns number of given keys that exist.
del	Removes the specified keys.
type	Returns the string representation of the type of value stored at key.
rename	Renames a key.
Code Example

async function simpleReadWriteExample() {
  // Set a key
  await redis.set('color', 'red');

  // Check if a key exists
  console.log('Key exists: ' + (await redis.exists('color')));

  // Get a key
  console.log('Color: ' + (await redis.get('color')));

  // Get the type of a key
  console.log('Type: ' + (await redis.type('color')));

  // Delete a key
  await redis.del('color');
}

Color: red
Type: string

Batch read/write
Command	Action
mGet	Returns the values of all specified keys.
mSet	Sets the given keys to their respective values.
Code Example

async function batchReadWriteExample() {
  // Set multiple keys at once
  await redis.mSet({
    name: 'Devvit',
    occupation: 'Developer',
    yearsOfExperience: '9000',
  });

  // Get multiple keys
  console.log('Result: ' + (await redis.mGet(['name', 'occupation'])));
}


Result: Devvit,Developer

Strings
Command	Action
getRange	Returns the substring of the string value stored at key, determined by the offsets start and end (both are inclusive).
setRange	Overwrites part of the string stored at key, starting at the specified offset, for the entire length of value.
strLen	Returns the length of the string value stored at key.
Code Example

async function stringsExample() {
  // First, set 'word' to 'tacocat'
  await redis.set('word', 'tacocat');

  // Use getRange() to get the letters in 'word' between index 0 to 3, inclusive
  console.log('Range from index 0 to 3: ' + (await redis.getRange('word', 0, 3)));

  // Use setRange() to insert 'blue' at index 0
  await redis.setRange('word', 0, 'blue');

  console.log('Word after using setRange(): ' + (await redis.get('word')));

  // Use strLen() to verify the word length
  console.log('Word length: ' + (await redis.strLen('word')));
}


Range from index 0 to 3: taco
Word after using setRange(): bluecat
Word length: 7

Hash
Redis hashes can store up to ~ 4.2 billion key-value pairs. We recommend using hash for managing collections of key-value pairs whenever possible and iterating over it using a combination of hscan, hkeys and hgetall.

Command	Action
hGet	Returns the value associated with field in the hash stored at key.
hMGet	Returns the value of all specified field in the hash stored at multiple keys.
hSet	Sets the specified fields to their respective values in the hash stored at key.
hSetNX	Sets field in the hash stored at key to value, only if field does not yet exist.ƒ
hDel	Removes the specified fields from the hash stored at key.
hGetAll	Returns a map of fields and their values stored in the hash.
hKeys	Returns all field names in the hash stored at key.
hScan	Iterates fields of Hash types and their associated values.
hIncrBy	Increments the score of member in the sorted set stored at key by value.
hLen	Returns the number of fields contained in the hash stored at key.
Code Examples

Numbers
Command	Action
incrBy	Increments the number stored at key by increment.
Code Example

async function numbersExample() {
  await redis.set('totalPoints', '53');

  console.log('Updated points: ' + (await redis.incrBy('totalPoints', 100)));
}


Updated points: 153

Key expiration
Command	Action
expire	Sets a timeout on key.
expireTime	Returns the remaining seconds at which the given key will expire.
Code Example

async function keyExpirationExample() {
  // Set a key 'product' with value 'milk'
  await redis.set('product', 'milk');

  // Get the current expireTime for the product
  console.log('Expire time: ' + (await redis.expireTime('product')));

  // Set the product to expire in 60 seconds
  await redis.expire('product', 60);

  // Get the updated expireTime for the product
  console.log('Updated expire time: ' + (await redis.expireTime('product')));
}


Expire time: 0
Updated expire time: 60

Transactions
Redis transactions allow a group of commands to be executed in a single isolated step. For example, to implement voting action in a polls app, these three actions need to happen together:

Store the selected option for the user.
Increment the count for selected option.
Add the user to voted user list.
The watch command provides an entrypoint for transactions. It returns a TxClientLike which can be used to call multi, exec, discard, unwatch, and all other Redis commands to be executed within a transaction.

You can sequence all of the above steps in a single transaction using multi and exec to ensure that either all of the steps happen together or none at all.

If an error occurs inside a transaction before exec is called, Redis discards the transaction automatically. See the Redis docs: Errors inside a transaction for more info.

Command	Action
multi	Marks the start of a transaction block.
exec	Executes all previously queued commands in a transaction and restores the connection state to normal.
discard	Flushes all previously queued commands in a transaction and restores the connection state to normal.
watch	Marks the given keys to be watched for conditional execution of a transaction. watch returns a TxClientLike which should be used to call Redis commands in a transaction.
unwatch	Flushes all the previously watched keys for a transaction.
Code Examples

Example 1

// Example using exec()
async function transactionsExample1() {
  await redis.mSet({ quantity: '5', karma: '32' });

  const txn = await redis.watch('quantity');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('karma', 10);
  await txn.set('name', 'Devvit');
  await txn.exec(); // Execute the commands in the transaction

  console.log(
    'Keys after completing transaction: ' +
      (await redis.mGet(['quantity', 'karma', 'name']))
  );
}

Keys after completing transaction: 5,42,Devvit

Example 2

// Example using discard()
async function transactionsExample2() {
  await redis.set('price', '25');

  const txn = await redis.watch('price');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('price', 5);
  await txn.discard(); // Discard the commands in the transaction

  console.log('Price value: ' + (await redis.get('price'))); // 'price' should still be '25'
}


Price value: 25

Example 3

// Example using unwatch()
async function transactionsExample3() {
  await redis.set('gold', '50');

  const txn = await redis.watch('gold');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('gold', 30);
  await txn.unwatch(); // Unwatch "gold"

  // Now that "gold" has been unwatched, we can increment its value
  // outside the transaction without canceling the transaction
  await redis.incrBy('gold', -20);

  await txn.exec(); // Execute the commands in the transaction

  console.log('Gold value: ' + (await redis.get('gold'))); // The value of 'gold' should be 50 + 30 - 20 = 60
}


Gold value: 60

Sorted set
Command	Action
zAdd	Adds all the specified members with the specified scores to the sorted set stored at key.
zCard	Returns the sorted set cardinality (number of elements) of the sorted set stored at key.
zRange	Returns the specified range of elements in the sorted set stored at key.

When using by: 'lex', the start and stop inputs will be prepended with [ by default, unless they already begin with [, ( or are one of the special values + or -.
zRem	Removes the specified members from the sorted set stored at key.
zScore	Returns the score of member in the sorted set at key.
zRank	Returns the rank of member in the sorted set stored at key.
zIncrBy	Increments the score of member in the sorted set stored at key by value.
zScan	Iterates elements of sorted set types and their associated scores. Note that there is no guaranteed ordering of elements in the result.
zRemRangeByLex	When all elements in a sorted set are inserted with the same score, this command removes the elements at key between the lexicographical range specified by min and max.
zRemRangeByRank	Removes all elements in the sorted set stored at key with rank between start and stop.
zRemRangeByScore	Removes all elements in the sorted set stored at key with a score between min and max (inclusive).
Code Examples

Example 1

// Example using zRange() with by 'score'
async function sortedSetExample1() {
  await redis.zAdd(
    'leaderboard',
    { member: 'louis', score: 37 },
    { member: 'fernando', score: 10 },
    { member: 'caesar', score: 20 },
    { member: 'alexander', score: 25 }
  );

  // Cardinality should be '4' as there are 4 elements in the leaderboard set
  console.log('Cardinality: ' + (await redis.zCard('leaderboard')));

  // View elements with scores between 0 and 30 inclusive, sorted by score
  let scores = await redis.zRange('leaderboard', 0, 30, { by: 'score' });
  console.log('Scores: ' + JSON.stringify(scores));

  // Remove 'fernando' from the leaderboard
  await redis.zRem('leaderboard', ['fernando']);

  // View the elements sorted by score again. This time 'fernando' should not appear in the output
  scores = await redis.zRange('leaderboard', 0, 30, { by: 'score' });
  console.log('Updated scores: ' + JSON.stringify(scores));

  // View caesar's score
  console.log("Caesar's score: " + (await redis.zScore('leaderboard', 'caesar')));
}


Cardinality: 4
Scores: [{"score":10,"member":"fernando"},{"score":20,"member":"caesar"},{"score":25,"member":"alexander"}]
Updated scores: [{"score":20,"member":"caesar"},{"score":25,"member":"alexander"}]
Caesar's score: 20


Example 2

// Example using zRange() with by 'lex'
async function sortedSetExample2() {
  await redis.zAdd(
    'checkpoints',
    { member: 'delta', score: 0 },
    { member: 'omega', score: 0 },
    { member: 'alpha', score: 0 },
    { member: 'charlie', score: 0 }
  );

  // View elements between the words 'alpha' and 'fox' inclusive, sorted lexicographically
  // Note that 'by: "lex"' only works if all elements have the same score
  const members = await redis.zRange('checkpoints', 'alpha', 'fox', { by: 'lex' });
  console.log('Members: ' + JSON.stringify(members));
}


Members: [{"score":0,"member":"alpha"},{"score":0,"member":"charlie"},{"score":0,"member":"delta"}]


Example 3

// Example using zRange() with by 'rank'
async function sortedSetExample3() {
  await redis.zAdd(
    'grades',
    { member: 'sam', score: 80 },
    { member: 'norma', score: 95 },
    { member: 'alex', score: 77 },
    { member: 'don', score: 84 },
    { member: 'zeek', score: 92 }
  );

  // View elements with a rank between 2 and 4 inclusive. Note that ranks start at index 0.
  const members = await redis.zRange('grades', 2, 4, { by: 'rank' });
  console.log('Members: ' + JSON.stringify(members));
}


Members: [{"score":84,"member":"don"},{"score":92,"member":"zeek"},{"score":95,"member":"norma"}]


Example 4

// Example using zRank() and zIncrBy()
async function sortedSetExample4() {
  await redis.zAdd(
    'animals',
    { member: 'zebra', score: 92 },
    { member: 'cat', score: 100 },
    { member: 'dog', score: 95 },
    { member: 'elephant', score: 97 }
  );

  // View the rank of 'dog' in the animals set
  // Rank should be '1' since 'dog' has the second lowest score. Note that ranks start at index 0.
  console.log("Dog's rank: " + (await redis.zRank('animals', 'dog')));

  // View the rank of 'zebra'
  console.log("Zebra's rank: " + (await redis.zRank('animals', 'zebra')));

  // Increase the score of 'dog' by 10
  await redis.zIncrBy('animals', 'dog', 10);

  // View the rank of 'dog' again. This time it should be '3' because dog has the highest score.
  console.log(
    "Dog's rank after incrementing score: " + (await redis.zRank('animals', 'dog'))
  );
}


Dog's rank: 1
Zebra's rank: 0
Dog's rank after incrementing score: 3

Example 5

// Example using zRemRangeByLex()
async function sortedSetExample5() {
  await redis.zAdd(
    'fruits',
    { member: 'kiwi', score: 0 },
    { member: 'mango', score: 0 },
    { member: 'banana', score: 0 },
    { member: 'orange', score: 0 },
    { member: 'apple', score: 0 }
  );

  // Remove fruits alphabetically ordered between 'kiwi' inclusive and 'orange' exclusive
  // Note: The symbols '[' and '(' indicate inclusive or exclusive, respectively. These must be included in the call to zRemRangeByLex().
  await redis.zRemRangeByLex('fruits', '[kiwi', '(orange');

  // Only 'apple', 'banana', and 'orange' should remain in the set
  const zScanResponse = await redis.zScan('fruits', 0);
  console.log('zScanResponse: ' + JSON.stringify(zScanResponse));
}


zScanResponse: {"cursor":0,"members":[{"score":0,"member":"apple"},{"score":0,"member":"banana"},{"score":0,"member":"orange"}]}


Example 6

// Example using zRemRangeByRank()
async function sortedSetExample6() {
  await redis.zAdd(
    'fruits',
    { member: 'kiwi', score: 10 },
    { member: 'mango', score: 20 },
    { member: 'banana', score: 30 },
    { member: 'orange', score: 40 },
    { member: 'apple', score: 50 }
  );

  // Remove fruits ranked 1 through 3 inclusive
  await redis.zRemRangeByRank('fruits', 1, 3);

  // Only 'kiwi' and 'apple' should remain in the set
  const zScanResponse = await redis.zScan('fruits', 0);
  console.log('zScanResponse: ' + JSON.stringify(zScanResponse));
}

zScanResponse: {"cursor":0,"members":[{"score":10,"member":"kiwi"},{"score":50,"member":"apple"}]}


Example 7

// Example using zRemRangeByScore() example
async function sortedSetExample7() {
  await redis.zAdd(
    'fruits',
    { member: 'kiwi', score: 10 },
    { member: 'mango', score: 20 },
    { member: 'banana', score: 30 },
    { member: 'orange', score: 40 },
    { member: 'apple', score: 50 }
  );

  // Remove fruits scored between 30 and 50 inclusive
  await redis.zRemRangeByScore('fruits', 30, 50);

  // Only 'kiwi' and 'mango' should remain in the set
  const zScanResponse = await redis.zScan('fruits', 0);
  console.log('zScanResponse: ' + JSON.stringify(zScanResponse));
}

zScanResponse: {"cursor":0,"members":[{"score":10,"member":"kiwi"},{"score":20,"member":"mango"}]}


Bitfield
Command	Action
bitfield	Performs a sequence of operations on a bit string
Code Example

async function bitfieldExample() {
  const setBits: number[] = await redis.bitfield('foo', 'set', 'i5', '#0', 11);
  console.log('Set result: ' + setBits); // [0]

  const getBits: number[] = await redis.bitfield('foo', 'get', 'i5', '#0');
  console.log('Get result: ' + setBits); // [11]

  const manyOperations: number[] = await redis.bitfield(
    'bar',
    'set',
    'u2',
    0,
    3,
    'get',
    'u2',
    0,
    'incrBy',
    'u2',
    0,
    1,
    'overflow',
    'sat',
    'get',
    'u2',
    0,
    'set',
    'u2',
    0,
    3,
    'incrBy',
    'u2',
    0,
    1
  );
  console.log('Results of many operations: ' + manyOperations); // [0, 3, 0, 0, 3, 3]
}


fooResults: [1, 0]
barResults: [0, 3, 0, 0, 3, 3]
