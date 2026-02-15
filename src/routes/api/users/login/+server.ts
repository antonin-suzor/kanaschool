import { json } from '@sveltejs/kit';
import { login } from '$lib/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
    try {
        if (!platform?.env.D1_DB) {
            return json({ error: 'Database not available' }, { status: 500 });
        }

        const body = await request.json();
        const { name, password } = body;

        if (!name || typeof name !== 'string' || !password || typeof password !== 'string') {
            return json({ error: 'Invalid request' }, { status: 400 });
        }

        const result = await login(platform.env.D1_DB, name, password);

        if ('error' in result) {
            return json({ error: result.error }, { status: 401 });
        }

        // Set auth cookie
        cookies.set('auth', JSON.stringify(result.user), {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return json({ user: result.user });
    } catch (error) {
        console.error('Login error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
