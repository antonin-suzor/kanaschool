# Kanaschool Development Guide

This file contains essential information for agentic coding agents working on the kanaschool codebase.

## Project Overview

**Purpose**: Web application for learning Japanese hiragana and katakana
**Stack**: SvelteKit + Svelte 5, TypeScript, Bun runtime, SQLite, TailwindCSS v4
**Architecture**: Full-stack application with client-side training and server-side data persistence

## Development Commands

### Essential Commands

```bash
# Start development server
bun run dev

# Type checking (crucial before committing)
bun run check

# Code formatting
bun run format

# Build for production
bun run build

# Preview production build
bun run preview
```

### Lint/Type Check Commands

- **Type checking**: `bun run check` (runs svelte-check with tsconfig)
- **Formatting check**: `bun run lint` (prettier --check)
- **Auto-format**: `bun run format` (prettier --write)

**Note**: Always run `bun run check` before committing changes.

## Code Style Guidelines

### General Rules

- **No emojis** in code, comments, or UI (explicitly forbidden)
- Use **Svelte 5 runes** for all reactive state management
- **TypeScript strict mode** enabled - all code must be properly typed
- **Single quotes** for strings
- **4-space indentation** (2 for YAML/JSON)
- **120 character line limit**
- **Semicolons required**
- **ES5 trailing commas**

### File Organization

- All custom types go in `/src/lib/types.ts`
- Database operations in `/src/lib/db.ts`
- Authentication in `/src/lib/auth.ts`

### Database Patterns

- **Soft deletes only** - use `deleted_at` fields, never hard delete
- All database operations use the centralized `/src/lib/db.ts` functions
- SQLite with proper foreign key constraints
- Seeded kana data from `/src/lib/kanas.json`

### Svelte/SvelteKit Conventions

- Use Svelte 5 runes (`$state`, `$derived`, `$effect`)
- Server-side authentication via `event.locals`
- API routes in `/src/routes/api/`
- Page routes follow SvelteKit file-based routing

### CSS/Tailwind Guidelines

- **TailwindCSS v4** - use modern v4 features
- Utility classes only - no custom CSS except in `/src/app.css`
- Responsive design with mobile-first approach

## Testing

**Status**: No test framework currently configured

- No test files exist in the project
- No test scripts in package.json
- When adding tests, set up appropriate framework (Vitest recommended)

## Key Dependencies

### Runtime & Framework

- **Bun** - JavaScript runtime and package manager
- **SvelteKit** - Full-stack framework
- **Svelte 5** - Component framework with runes
- **TypeScript** - Type safety

### Database & Auth

- **SQLite** - Database via Bun's built-in support
- **Bun password utilities** - Authentication hashing

### Frontend

- **TailwindCSS v4** - Styling
- **Lucide/Svelte** - Icons

## Environment Setup

Required environment variables:

```env
SQLITE_FILE=kanaschool_db.sqlite
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/xxx/xxx
```

## Development Workflow

1. **Install**: `bun install`
2. **Type Check**: `bun --bun run check` (before any commit)
3. **Format**: `bun --bun run format`
4. **Build**: `bun --bun run build`

## Architecture Notes

### Authentication

- Cookie-based authentication using SvelteKit's event.locals
- Password hashing with Bun utilities
- URL-friendly usernames with validation

### Data Flow

- Client-side training mode (real-time)
- Server-side session persistence
- Progress tracking and statistics
- Public/private session visibility

### Database Schema

- `users` - User accounts
- `sessions` - Training sessions
- `kanas` - Static kana data
- `session_kanas` - User answers and progress

## Critical Rules

1. **Never use emojis** - explicitly forbidden per design.md
2. **Always use Svelte 5 runes** - no legacy Svelte reactivity
3. **Soft deletes only** - never hard delete data
4. **TypeScript strict** - all code must be fully typed
5. **Run type checker** - `bun --bun run check` before committing
6. **Follow file organization** - keep types, utils, database logic separate

## Configuration Files

- **TypeScript**: `tsconfig.json` (strict mode enabled)
- **SvelteKit**: `svelte.config.js` (Bun adapter)
- **Vite**: `vite.config.ts` (build configuration)
- **Prettier**: `.prettierrc.json` (code formatting)
- **Tailwind**: Configured for v4 with modern features

## Design Philosophy

Clean, functional Japanese learning application with:

- Minimal, distraction-free interface
- Focus on effective learning progression
- Data-driven training sessions
- User progress tracking
- Reference materials accessible during learning
