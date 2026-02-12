import { getDb } from './db';
import type { AuthUser, User } from './types';

export async function hashPassword(password: string): Promise<string> {
    return await Bun.password.hash(password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
}

export function isValidUsername(username: string): boolean {
    if (!username || username.trim().length === 0) {
        return false;
    }
    // URL-friendly: alphanumeric, hyphens, underscores only
    return /^[a-zA-Z0-9_-]+$/.test(username);
}

export function isValidPassword(password: string): boolean {
    return Boolean(password && password.length > 0);
}

export function getUserById(id: number): AuthUser | null {
    const db = getDb();
    const result = db.query('SELECT id, name, is_public FROM users WHERE id = ? AND deleted_at IS NULL').get(id) as
        | (Omit<AuthUser, 'is_public'> & { is_public: number })
        | undefined;

    if (!result) return null;

    return {
        ...result,
        is_public: Boolean(result.is_public),
    };
}

export function getUserByName(name: string): AuthUser | null {
    const db = getDb();
    const result = db.query('SELECT id, name, is_public FROM users WHERE name = ? AND deleted_at IS NULL').get(name) as
        | (Omit<AuthUser, 'is_public'> & { is_public: number })
        | undefined;

    if (!result) return null;

    return {
        ...result,
        is_public: Boolean(result.is_public),
    };
}

export async function signup(name: string, password: string): Promise<{ user: AuthUser } | { error: string }> {
    if (!isValidUsername(name)) {
        return { error: 'Username must be URL-friendly (alphanumeric, hyphens, underscores only)' };
    }

    if (!isValidPassword(password)) {
        return { error: 'Password cannot be empty' };
    }

    const db = getDb();

    // Check if user already exists
    const existing = db.query('SELECT id FROM users WHERE name = ? AND deleted_at IS NULL').get(name) as
        | { id: number }
        | undefined;

    if (existing) {
        return { error: 'Username already taken' };
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    try {
        db.query(
            'INSERT INTO users (name, password_hash, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
        ).run(name, passwordHash, 0, now, now);

        const user = getUserByName(name);
        if (!user) {
            return { error: 'Failed to create user' };
        }

        return { user };
    } catch (error) {
        return { error: 'Failed to create user' };
    }
}

export async function login(name: string, password: string): Promise<{ user: AuthUser } | { error: string }> {
    const db = getDb();

    const result = db
        .query('SELECT id, name, is_public, password_hash FROM users WHERE name = ? AND deleted_at IS NULL')
        .get(name) as (Omit<AuthUser, 'is_public'> & { is_public: number; password_hash: string }) | undefined;

    if (!result) {
        return { error: 'Invalid username or password' };
    }

    const passwordValid = await verifyPassword(password, result.password_hash);
    if (!passwordValid) {
        return { error: 'Invalid username or password' };
    }

    const user: AuthUser = {
        ...result,
        is_public: Boolean(result.is_public),
    };

    return { user };
}

export async function updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
): Promise<{ success: true } | { error: string }> {
    if (!isValidPassword(newPassword)) {
        return { error: 'New password cannot be empty' };
    }

    const db = getDb();

    // Get user with password hash
    const result = db.query('SELECT id, password_hash FROM users WHERE id = ? AND deleted_at IS NULL').get(userId) as
        | { id: number; password_hash: string }
        | undefined;

    if (!result) {
        return { error: 'User not found' };
    }

    // Verify old password
    const passwordValid = await verifyPassword(oldPassword, result.password_hash);
    if (!passwordValid) {
        return { error: 'Current password is incorrect' };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    const now = new Date().toISOString();

    try {
        db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newPasswordHash, now, userId);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update password' };
    }
}

export async function updateUsername(
    userId: number,
    newUsername: string
): Promise<{ user: AuthUser } | { error: string }> {
    if (!isValidUsername(newUsername)) {
        return { error: 'Username must be URL-friendly (alphanumeric, hyphens, underscores only)' };
    }

    const db = getDb();

    // Check if new username is already taken (by someone else)
    const existing = db
        .query('SELECT id FROM users WHERE name = ? AND id != ? AND deleted_at IS NULL')
        .get(newUsername, userId) as { id: number } | undefined;

    if (existing) {
        return { error: 'Username already taken' };
    }

    const now = new Date().toISOString();

    try {
        db.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?').run(newUsername, now, userId);

        const user = getUserById(userId);
        if (!user) {
            return { error: 'Failed to update username' };
        }

        return { user };
    } catch (error) {
        return { error: 'Failed to update username' };
    }
}

export function updateProfileVisibility(userId: number, isPublic: boolean): { success: true } | { error: string } {
    const db = getDb();

    const now = new Date().toISOString();

    try {
        db.prepare('UPDATE users SET is_public = ?, updated_at = ? WHERE id = ?').run(isPublic ? 1 : 0, now, userId);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update profile visibility' };
    }
}

export async function deleteAccount(userId: number, password: string): Promise<{ success: true } | { error: string }> {
    const db = getDb();

    // Get user with password hash
    const result = db.query('SELECT id, password_hash FROM users WHERE id = ? AND deleted_at IS NULL').get(userId) as
        | { id: number; password_hash: string }
        | undefined;

    if (!result) {
        return { error: 'User not found' };
    }

    // Verify password
    const passwordValid = await verifyPassword(password, result.password_hash);
    if (!passwordValid) {
        return { error: 'Password is incorrect' };
    }

    const now = new Date().toISOString();

    try {
        // Soft delete the user
        db.prepare('UPDATE users SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now, now, userId);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete account' };
    }
}

export function deleteSession(userId: number, sessionId: number): { success: true } | { error: string } {
    const db = getDb();

    // Get session and verify ownership
    const session = db.query('SELECT id, user_id FROM sessions WHERE id = ? AND deleted_at IS NULL').get(sessionId) as
        | { id: number; user_id: number }
        | undefined;

    if (!session) {
        return { error: 'Session not found' };
    }

    if (session.user_id !== userId) {
        return { error: 'You do not have permission to delete this session' };
    }

    const now = new Date().toISOString();

    try {
        // Soft delete the session
        db.prepare('UPDATE sessions SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now, now, sessionId);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete session' };
    }
}
