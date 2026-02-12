import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return json({ error: 'Not authenticated' }, { status: 401 });
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

    const db = getDb();

    // Verify session ownership
    const session = db
        .query('SELECT * FROM sessions WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
        .get(sessionId, locals.user.id) as any;

    if (!session) {
        return json({ error: 'Session not found' }, { status: 404 });
    }

    try {
        const now = new Date().toISOString();
        db.prepare('UPDATE sessions SET is_public = ?, updated_at = ? WHERE id = ?').run(
            isPublic ? 1 : 0,
            now,
            sessionId
        );

        return json({ success: true });
    } catch (error) {
        console.error('Error updating session:', error);
        return json({ error: 'Failed to update session' }, { status: 500 });
    }
};
