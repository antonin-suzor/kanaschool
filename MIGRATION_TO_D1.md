# Migration from Bun SQLite to Cloudflare D1

## Overview

This document outlines the complete migration of kanaschool from Bun's native SQLite support to Cloudflare D1 (serverless SQLite database).

## Key Changes

### 1. Database Migrations

**Files Created:**
- `migrations/0001_initial_schema.sql` - Creates all tables (users, sessions, kanas, session_kanas) with indexes
- `migrations/0002_seed_kanas.sql` - Populates kana data (auto-generated from `src/lib/kanas.json`)

**Previously:** Database was initialized on server startup via `src/lib/db.ts`
**Now:** Migrations are applied automatically by Wrangler during deployment

### 2. Password Hashing

**New File:** `src/lib/crypto.ts`

**Changes:**
- Replaced Bun's `Bun.password.hash()` and `Bun.password.verify()` with Web Crypto API
- Uses PBKDF2 with SHA-256 (100,000 iterations)
- Compatible with Cloudflare Workers environment
- Password format: `{saltHex}${hashHex}` (hex-encoded salt and hash)

### 3. Database Module Refactoring

**File:** `src/lib/db.ts`

**Major Changes:**
- Removed `initializeDb()` and `getDb()` functions (no longer needed)
- All functions now accept `D1Database` as first parameter
- Changed from synchronous calls to async/await with D1 API
- Updated all query methods from `.query()/.prepare()` to D1's `.prepare().bind().first()/all()`
- Added type definitions for query results using D1's generic syntax: `first<T>()`, `all<T>()`

**Key Functions Added:**
- User operations: `getUserById()`, `getUserByName()`, `getUserWithPassword()`, `createUser()`, etc.
- Session operations: `createSession()`, `finishSession()`, `updateSessionVisibility()`, etc.
- Kana queries: `getHiraganas()`, `getKatakanas()`, `getKanaByReading()`, etc.
- Statistics: Various aggregation functions for user stats, session stats, correct answer percentages

### 4. Authentication Module Updates

**File:** `src/lib/auth.ts`

**Changes:**
- All functions now accept `D1Database` as first parameter
- Replaced Bun password imports with `src/lib/crypto.ts`
- Updated to use new async database functions
- All public functions are now async
- Updated function signatures to match new DB API

### 5. Server Hooks

**File:** `src/hooks.server.ts`

**Changes:**
- Removed `initializeDb()` call (no longer needed with migrations)
- Updated auth cookie verification to use D1
- Gracefully handles case where D1 is unavailable (falls back to trusting cookie)
- Accesses database via `event.platform?.env.D1_DB`

### 6. API Routes

**Updated All Routes:**
- `src/routes/api/users/login/+server.ts`
- `src/routes/api/users/signup/+server.ts`
- `src/routes/api/users/update/+server.ts`
- `src/routes/api/sessions/create/+server.ts`
- `src/routes/api/sessions/[id]/finish/+server.ts`
- `src/routes/api/sessions/[id]/guess/+server.ts`
- `src/routes/api/sessions/[id]/visibility/+server.ts`

**Common Changes:**
- Extract D1 database from `platform?.env.D1_DB`
- All database operations now async
- Added database availability checks with proper error responses
- Updated to use new async auth and db functions

### 7. Page Server Load Functions

**Updated All Pages:**
- `src/routes/+page.server.ts` (home/stats)
- `src/routes/kanas/+page.server.ts`
- `src/routes/hiraganas/+page.server.ts`
- `src/routes/katakanas/+page.server.ts`
- `src/routes/hiraganas/[reading]/+page.server.ts`
- `src/routes/katakanas/[reading]/+page.server.ts`
- `src/routes/sessions/+page.server.ts` (sessions stats)
- `src/routes/sessions/my/+page.server.ts` (user's sessions)
- `src/routes/sessions/[id]/+page.server.ts` (session detail)
- `src/routes/users/+page.server.ts` (users stats)
- `src/routes/users/[name]/+page.server.ts` (user profile)

**Common Changes:**
- Made all load functions async
- Added `platform` parameter to access `platform.env.D1_DB`
- Changed synchronous database calls to async/await
- Added null checks for database availability with graceful fallbacks
- Added type transformations where necessary (D1 returns numbers for booleans)

### 8. Type Handling

**Key Differences:**
- D1 returns booleans as integers (0/1)
- Some transformations were added to convert these back to booleans for type consistency
- Session detail page transforms guessed kanas to ensure proper typing for Svelte components

## Configuration Changes

**wrangler.toml Updates:**
- D1 database binding already configured: `D1_DB`
- Database migrations directory configured: `migrations_dir = "migrations"`
- Database ID configured for D1 instance

**app.d.ts:**
- Already has correct `D1Database` type in `Platform.env`

## Development Workflow

### Before (Bun):
```bash
# Development
bun run dev

# Database initialized automatically on startup
# SQLite file created at SQLITE_FILE path
```

### After (Cloudflare D1):
```bash
# Development
bun run dev

# Migrations applied automatically by Wrangler
# D1 database used via platform.env.D1_DB
```

### Deployment:
```bash
# Wrangler automatically:
# 1. Applies pending migrations to D1
# 2. Deploys worker with D1 binding
# 3. Makes database available via platform.env.D1_DB
bun run deploy
```

## Testing Checklist

- [ ] Type checking passes: `bun run check`
- [ ] Login/signup flows work
- [ ] Session creation and training works
- [ ] User profile updates work
- [ ] Statistics pages load correctly
- [ ] Kana detail pages load
- [ ] Soft deletes work (users, sessions)
- [ ] Password hashing/verification works
- [ ] Database migrations apply successfully

## Breaking Changes

1. **Synchronous to Asynchronous:** All database operations are now async and require `await`
2. **Function Parameters:** All database functions now require `D1Database` parameter
3. **Password Hashing:** New crypto format - cannot use old Bun-hashed passwords (migration needed for existing data)
4. **Environment Setup:** Requires D1 database binding in Cloudflare environment

## Migration Path for Existing Data

If migrating existing user data with passwords:
1. Create a migration script that:
   - Exports users from old SQLite database
   - Re-hashes passwords using new crypto module
   - Imports into D1 database
   
Alternatively, require password reset on first login after migration.

## Performance Considerations

- D1 queries are now network-bound (vs local SQLite)
- Batch operations may need optimization for high-latency environments
- Consider implementing caching for frequently accessed data (like kana lists)
- Connection pooling handled automatically by Cloudflare

## Future Improvements

1. Implement query caching for kana lists (rarely change)
2. Add database query logging for debugging
3. Consider stored procedures for complex aggregations
4. Implement pagination for large result sets
5. Add retry logic for transient failures