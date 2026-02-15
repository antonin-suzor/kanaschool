import { getUserById } from '$lib/auth';
import type { Handle } from '@sveltejs/kit';
import type { AuthUser } from '$lib/types';

export const handle: Handle = async ({ event, resolve }) => {
    // Load user from auth cookie
    const authCookie = event.cookies.get('auth');
    if (authCookie) {
        try {
            const user = JSON.parse(authCookie) as AuthUser;
            // Verify user still exists by checking in the database
            const db = (event.platform?.env as any)?.D1_DB;
            if (db) {
                const validUser = await getUserById(db, user.id);
                if (validUser) {
                    event.locals.user = validUser;
                } else {
                    event.cookies.delete('auth', { path: '/' });
                }
            } else {
                // If we can't access the database, trust the cookie
                event.locals.user = user;
            }
        } catch (error) {
            event.cookies.delete('auth', { path: '/' });
        }
    }

    return resolve(event);
};
