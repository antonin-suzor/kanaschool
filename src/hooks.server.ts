import { initializeDb } from '$lib/db';
import { getUserById } from '$lib/auth';
import type { Handle } from '@sveltejs/kit';
import type { AuthUser } from '$lib/types';

// Initialize database on server startup
initializeDb();

export const handle: Handle = async ({ event, resolve }) => {
    // Load user from auth cookie
    const authCookie = event.cookies.get('auth');
    if (authCookie) {
        try {
            const user = JSON.parse(authCookie) as AuthUser;
            // Verify user still exists
            const validUser = getUserById(user.id);
            if (validUser) {
                event.locals.user = validUser;
            } else {
                event.cookies.delete('auth', { path: '/' });
            }
        } catch (error) {
            event.cookies.delete('auth', { path: '/' });
        }
    }

    return resolve(event);
};
