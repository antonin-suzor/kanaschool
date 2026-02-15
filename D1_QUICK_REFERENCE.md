# Cloudflare D1 Quick Reference Guide

## Database Access

### In API Routes
```typescript
export const POST: RequestHandler = async ({ request, platform }) => {
    const db = platform?.env.D1_DB;
    if (!db) {
        return json({ error: 'Database unavailable' }, { status: 500 });
    }
    
    // Use db for queries
};
```

### In Page Server Load Functions
```typescript
export async function load({ platform }) {
    const db = platform?.env.D1_DB;
    if (!db) {
        return { data: null }; // Graceful fallback
    }
    
    // Use db for queries
}
```

### In Hooks
```typescript
const db = (event.platform?.env as any)?.D1_DB;
if (db) {
    // Use db for queries
}
```

## Common Database Operations

### User Operations
```typescript
import * as db from '$lib/db';

// Get user
const user = await db.getUserById(database, userId);
const user = await db.getUserByName(database, username);

// Create user
const newUser = await db.createUser(database, username, passwordHash);

// Update user
await db.updateUsername(database, userId, newName);
await db.updateUserPassword(database, userId, newHash);
await db.updateUserVisibility(database, userId, isPublic);

// Delete user (soft delete)
await db.softDeleteUser(database, userId);
```

### Session Operations
```typescript
// Get sessions
const session = await db.getSession(database, sessionId);
const session = await db.getUserSession(database, sessionId, userId);
const sessions = await db.getUserUnfinishedSessions(database, userId);
const sessions = await db.getUserFinishedSessions(database, userId);

// Create session
const sessionId = await db.createSession(database, userId, {
    hiragana: 1,
    katakana: 1,
    mods: 1,
    mult: 1,
});

// Update session
await db.finishSession(database, sessionId);
await db.updateSessionVisibility(database, sessionId, isPublic);

// Delete session (soft delete)
await db.softDeleteSession(database, sessionId);
```

### Kana Operations
```typescript
// Get kanas
const kanas = await db.getAllKanas(database);
const hiraganas = await db.getHiraganas(database);
const katakanas = await db.getKatakanas(database);
const kana = await db.getKanaByReading(database, 'a', false); // false = hiragana
```

### Recording Guesses
```typescript
// Get guess count for kana in session
const count = await db.getGuessCountForKanaInSession(database, sessionId, kanaId);

// Record a guess
await db.recordGuess(database, sessionId, kanaId, isCorrect, multPosition);

// Get all guessed kanas for session
const guessed = await db.getSessionGuessedKanas(database, sessionId);
```

### Statistics
```typescript
// Counts
const totalUsers = await db.getTotalUserCount(database);
const totalSessions = await db.getTotalSessionCount(database);
const userSessions = await db.getUserSessionCount(database, userId);

// Answers
const stats = await db.getAllTimeAnswerStats(database);
const stats = await db.getDateRangeAnswerStats(database, startDate);
const stats = await db.getUserAnswerStats(database, userId);

// Ratios
const ratio = await db.getKanaRatioStats(database);
const ratio = await db.getDiacriticsRatioStats(database);

// Aggregates
const avg = await db.getAverageSessionsPerUser(database);
const max = await db.getMaxSessionsForAnyUser(database);
```

## Password Operations

### Hashing
```typescript
import { hashPassword, verifyPassword } from '$lib/crypto';

const hash = await hashPassword('mypassword');
const isValid = await verifyPassword('mypassword', hash);
```

### Authentication
```typescript
import * as auth from '$lib/auth';

// Signup
const result = await auth.signup(database, username, password);
if ('error' in result) {
    // Handle error
} else {
    const user = result.user; // AuthUser
}

// Login
const result = await auth.login(database, username, password);
if ('error' in result) {
    // Handle error
} else {
    const user = result.user; // AuthUser
}

// Update password
const result = await auth.updatePassword(database, userId, oldPassword, newPassword);

// Delete account
const result = await auth.deleteAccount(database, userId, password);
```

## Type Definitions

### AuthUser
```typescript
interface AuthUser {
    id: number;
    name: string;
    is_public: boolean;
}
```

### Kana
```typescript
interface Kana {
    id: number;
    reading: string;
    is_katakana: boolean;
    mod: number;
    consonant_line: string;
    vowel_column: string;
    unicode: string;
}
```

### Session
```typescript
interface Session {
    id: number;
    user_id: number;
    is_public: number; // 0 or 1
    hiragana: number;
    katakana: number;
    mods: number;
    mult: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    finished_at: string | null;
}
```

## Error Handling

### In API Routes
```typescript
if (!platform?.env.D1_DB) {
    return json({ error: 'Database not available' }, { status: 500 });
}

try {
    // Database operations
    return json({ success: true });
} catch (error) {
    console.error('Operation failed:', error);
    return json({ error: 'Failed to process request' }, { status: 500 });
}
```

### In Page Load
```typescript
if (!platform?.env.D1_DB) {
    // Return empty/default data
    return {
        data: [],
        // or
        data: null,
    };
}

try {
    // Database operations
    return { data };
} catch (error) {
    console.error('Load failed:', error);
    throw error(500, 'Failed to load data');
}
```

## Query Patterns

### Single Row
```typescript
const result = await database
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first<UserRow>();

if (!result) {
    // No result
}
```

### Multiple Rows
```typescript
const results = await database
    .prepare('SELECT * FROM sessions WHERE user_id = ?')
    .bind(userId)
    .all<SessionRow>();

const sessions = results.results || []; // Array of rows
```

### Insert/Update
```typescript
const result = await database
    .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
    .bind(name, email)
    .run();

// Check success
if (!result.success) {
    // Handle error
}

// Get inserted ID
const id = result.meta.last_row_id;
```

## Common Pitfalls

❌ **Wrong**: Synchronous database calls
```typescript
const user = db.getUserById(userId); // Error: not awaited
```

✅ **Correct**: Await async calls
```typescript
const user = await db.getUserById(database, userId);
```

---

❌ **Wrong**: Missing database parameter
```typescript
await getUserById(userId); // Error: db parameter missing
```

✅ **Correct**: Pass database as first parameter
```typescript
await db.getUserById(database, userId);
```

---

❌ **Wrong**: No null checks
```typescript
const db = platform.env.D1_DB;
await db.prepare(...); // Error: db could be undefined
```

✅ **Correct**: Check for database
```typescript
const db = platform?.env.D1_DB;
if (!db) {
    return json({ error: 'Database unavailable' }, { status: 500 });
}
```

---

❌ **Wrong**: Forgetting .first() or .all()
```typescript
const result = await database.prepare('SELECT * FROM users').bind(id);
```

✅ **Correct**: Use appropriate method
```typescript
const result = await database
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first<UserRow>();
```

## Soft Deletes

All deletions use soft deletes (set `deleted_at` field):

```typescript
// When querying, always filter out deleted rows
// ✓ All db functions already do this
// ✓ deleted_at IS NULL is in WHERE clause

// To "restore" a deleted item:
UPDATE users SET deleted_at = NULL WHERE id = ?

// Data is never permanently deleted
// Can be recovered if needed
```

## Testing Locally

```bash
# Type check before commit
bun run check

# Run development server
bun run dev

# Build and preview
bun run build
bun run preview
```

## Deployment

```bash
# Deploy to Cloudflare
bun run deploy

# Wrangler will automatically:
# 1. Apply pending migrations
# 2. Create/update D1 database
# 3. Deploy worker with D1 binding
# 4. Make database available via platform.env.D1_DB
```

## Useful Links

- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler D1 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [SvelteKit Cloudflare Adapter](https://github.com/sveltejs/kit/tree/main/packages/adapter-cloudflare)