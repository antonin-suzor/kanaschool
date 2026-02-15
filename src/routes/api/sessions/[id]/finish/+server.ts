import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import * as db from '$lib/db';

export const POST: RequestHandler = async ({ params, locals, platform }) => {
    if (!locals.user) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!platform?.env.D1_DB) {
        return json({ error: 'Database not available' }, { status: 500 });
    }

    const sessionId = parseInt(params.id || '', 10);
    if (isNaN(sessionId)) {
        return json({ error: 'Invalid session ID' }, { status: 400 });
    }

    try {
        // Verify ownership
        const session = await db.getUserSession(platform.env.D1_DB, sessionId, locals.user.id);
        if (!session) {
            return json({ error: 'Session not found' }, { status: 404 });
        }

        await db.finishSession(platform.env.D1_DB, sessionId);

        return json({ success: true });
    } catch (error) {
        console.error('Error finishing session:', error);
        return json({ error: 'Failed to finish session' }, { status: 500 });
    }
};
