import { json } from '@sveltejs/kit';
import { updatePassword, updateUsername, updateProfileVisibility, deleteAccount, deleteSession } from '$lib/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { action, oldPassword, newPassword, newUsername, isPublic, sessionId, password } = body;

        if (!action || typeof action !== 'string') {
            return json({ error: 'Invalid request' }, { status: 400 });
        }

        if (action === 'updatePassword') {
            if (!oldPassword || typeof oldPassword !== 'string' || !newPassword || typeof newPassword !== 'string') {
                return json({ error: 'Old password and new password are required' }, { status: 400 });
            }

            const result = await updatePassword(locals.user.id, oldPassword, newPassword);

            if ('error' in result) {
                return json({ error: result.error }, { status: 400 });
            }

            return json({ success: true });
        }

        if (action === 'updateUsername') {
            if (!newUsername || typeof newUsername !== 'string') {
                return json({ error: 'New username is required' }, { status: 400 });
            }

            const result = await updateUsername(locals.user.id, newUsername);

            if ('error' in result) {
                return json({ error: result.error }, { status: 400 });
            }

            // Update auth cookie with new username
            cookies.set('auth', JSON.stringify(result.user), {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            return json({ user: result.user });
        }

        if (action === 'updateVisibility') {
            if (isPublic === undefined || typeof isPublic !== 'boolean') {
                return json({ error: 'isPublic must be a boolean' }, { status: 400 });
            }

            const result = updateProfileVisibility(locals.user.id, isPublic);

            if ('error' in result) {
                return json({ error: result.error }, { status: 400 });
            }

            // Update auth cookie with new visibility
            const updatedUser = { ...locals.user, is_public: isPublic };
            cookies.set('auth', JSON.stringify(updatedUser), {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            return json({ success: true, user: updatedUser });
        }

        if (action === 'deleteAccount') {
            if (!password || typeof password !== 'string') {
                return json({ error: 'Password is required' }, { status: 400 });
            }

            const result = await deleteAccount(locals.user.id, password);

            if ('error' in result) {
                return json({ error: result.error }, { status: 400 });
            }

            // Clear auth cookie
            cookies.delete('auth', { path: '/' });

            return json({ success: true });
        }

        if (action === 'deleteSession') {
            if (!sessionId || typeof sessionId !== 'number') {
                return json({ error: 'Session ID is required' }, { status: 400 });
            }

            const result = deleteSession(locals.user.id, sessionId);

            if ('error' in result) {
                return json({ error: result.error }, { status: 400 });
            }

            return json({ success: true });
        }

        return json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Update error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
