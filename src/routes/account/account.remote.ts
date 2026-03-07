import { command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { updatePassword, updateUsername, updateProfileVisibility, deleteAccount } from '$lib/auth';
import * as v from 'valibot';
import { error } from '@sveltejs/kit';

const UpdatePasswordSchema = v.object({
    oldPassword: v.string(),
    newPassword: v.string(),
});

const UpdateUsernameSchema = v.object({
    newUsername: v.string(),
});

const UpdateVisibilitySchema = v.object({
    isPublic: v.boolean(),
});

const DeleteAccountSchema = v.object({
    _password: v.string(),
});

export const changePassword = command(UpdatePasswordSchema, async ({ oldPassword, newPassword }) => {
    const event = getRequestEvent();

    if (!event.locals.user) {
        error(401, 'Not authenticated');
    }

    if (!event.platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    const result = await updatePassword(event.platform.env.D1_DB, event.locals.user.id, oldPassword, newPassword);

    if ('error' in result) {
        throw new Error(result.error);
    }
});

export const changeUsername = command(UpdateUsernameSchema, async ({ newUsername }) => {
    const event = getRequestEvent();

    if (!event.locals.user) {
        error(401, 'Not authenticated');
    }

    if (!event.platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    const result = await updateUsername(event.platform.env.D1_DB, event.locals.user.id, newUsername);

    if ('error' in result) {
        throw new Error(result.error);
    }

    event.cookies.set('auth', JSON.stringify(result.user), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return result.user;
});

export const changeVisibility = command(UpdateVisibilitySchema, async ({ isPublic }) => {
    const event = getRequestEvent();

    if (!event.locals.user) {
        error(401, 'Not authenticated');
    }

    if (!event.platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    const result = await updateProfileVisibility(event.platform.env.D1_DB, event.locals.user.id, isPublic);

    if ('error' in result) {
        throw new Error(result.error);
    }

    const updatedUser = { ...event.locals.user, is_public: isPublic };

    event.cookies.set('auth', JSON.stringify(updatedUser), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return updatedUser;
});

export const deleteUserAccount = command(DeleteAccountSchema, async ({ _password }) => {
    const event = getRequestEvent();

    if (!event.locals.user) {
        error(401, 'Not authenticated');
    }

    if (!event.platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    const result = await deleteAccount(event.platform.env.D1_DB, event.locals.user.id, _password);

    if ('error' in result) {
        throw new Error(result.error);
    }

    event.cookies.delete('auth', { path: '/' });
});
