import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import * as db from '$lib/db';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
    if (!locals.user) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!platform?.env.D1_DB) {
        return json({ error: 'Database not available' }, { status: 500 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { sessionId, isPublic } = body;

    if (!sessionId || isPublic === undefined) {
        return json({ error: 'Missing sessionId or isPublic' }, { status: 400 });
    }

    try {
        const database = platform.env.D1_DB;

        // Verify session ownership
        const session = await db.getUserSession(database, sessionId, locals.user.id);

        if (!session) {
            return json({ error: 'Session not found' }, { status: 404 });
        }

        await db.updateSessionVisibility(database, sessionId, isPublic);

        return json({ success: true });
    } catch (error) {
        console.error('Error updating session:', error);
        return json({ error: 'Failed to update session' }, { status: 500 });
    }
};
