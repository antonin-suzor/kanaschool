import { hashPassword, verifyPassword } from './crypto';
import type { D1Database } from '@cloudflare/workers-types';
import type { AuthUser } from './types';
import * as db from './db';

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

export async function getUserById(database: D1Database, id: number): Promise<AuthUser | null> {
    return db.getUserById(database, id);
}

export async function getUserByName(database: D1Database, name: string): Promise<AuthUser | null> {
    return db.getUserByName(database, name);
}

export async function signup(
    database: D1Database,
    name: string,
    password: string
): Promise<{ user: AuthUser } | { error: string }> {
    if (!isValidUsername(name)) {
        return { error: 'Username must be URL-friendly (alphanumeric, hyphens, underscores only)' };
    }

    if (!isValidPassword(password)) {
        return { error: 'Password cannot be empty' };
    }

    // Check if user already exists
    const existing = await db.userExists(database, name);
    if (existing) {
        return { error: 'Username already taken' };
    }

    const passwordHash = await hashPassword(password);

    try {
        const user = await db.createUser(database, name, passwordHash);
        if (!user) {
            return { error: 'Failed to create user' };
        }

        return { user };
    } catch (error) {
        return { error: 'Failed to create user' };
    }
}

export async function login(
    database: D1Database,
    name: string,
    password: string
): Promise<{ user: AuthUser } | { error: string }> {
    const result = await db.getUserWithPassword(database, name);

    if (!result) {
        return { error: 'Invalid username or password' };
    }

    const passwordValid = await verifyPassword(password, result.password_hash);
    if (!passwordValid) {
        return { error: 'Invalid username or password' };
    }

    const user: AuthUser = {
        id: result.id,
        name: result.name,
        is_public: result.is_public,
    };

    return { user };
}

export async function updatePassword(
    database: D1Database,
    userId: number,
    oldPassword: string,
    newPassword: string
): Promise<{ success: true } | { error: string }> {
    if (!isValidPassword(newPassword)) {
        return { error: 'New password cannot be empty' };
    }

    // Get user with password hash
    const result = await db.getUserPasswordHash(database, userId);

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

    try {
        await db.updateUserPassword(database, userId, newPasswordHash);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update password' };
    }
}

export async function updateUsername(
    database: D1Database,
    userId: number,
    newUsername: string
): Promise<{ user: AuthUser } | { error: string }> {
    if (!isValidUsername(newUsername)) {
        return { error: 'Username must be URL-friendly (alphanumeric, hyphens, underscores only)' };
    }

    // Check if new username is already taken (by someone else)
    const existing = await db.usernameIsTaken(database, newUsername, userId);

    if (existing) {
        return { error: 'Username already taken' };
    }

    try {
        await db.updateUsername(database, userId, newUsername);

        const user = await db.getUserById(database, userId);
        if (!user) {
            return { error: 'Failed to update username' };
        }

        return { user };
    } catch (error) {
        return { error: 'Failed to update username' };
    }
}

export async function updateProfileVisibility(
    database: D1Database,
    userId: number,
    isPublic: boolean
): Promise<{ success: true } | { error: string }> {
    try {
        await db.updateUserVisibility(database, userId, isPublic);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update profile visibility' };
    }
}

export async function deleteAccount(
    database: D1Database,
    userId: number,
    password: string
): Promise<{ success: true } | { error: string }> {
    // Get user with password hash
    const result = await db.getUserPasswordHash(database, userId);

    if (!result) {
        return { error: 'User not found' };
    }

    // Verify password
    const passwordValid = await verifyPassword(password, result.password_hash);
    if (!passwordValid) {
        return { error: 'Password is incorrect' };
    }

    try {
        // Soft delete the user
        await db.softDeleteUser(database, userId);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete account' };
    }
}

export async function deleteSession(
    database: D1Database,
    userId: number,
    sessionId: number
): Promise<{ success: true } | { error: string }> {
    // Get session and verify ownership
    const session = await db.getUserSession(database, sessionId, userId);

    if (!session) {
        return { error: 'Session not found' };
    }

    if (session.user_id !== userId) {
        return { error: 'You do not have permission to delete this session' };
    }

    try {
        // Soft delete the session
        await db.softDeleteSession(database, sessionId);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete session' };
    }
}
