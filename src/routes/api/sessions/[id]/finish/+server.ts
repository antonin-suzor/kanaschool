import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db';

export const POST: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionId = parseInt(params.id || '', 10);
    if (isNaN(sessionId)) {
        return json({ error: 'Invalid session ID' }, { status: 400 });
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
        db.prepare('UPDATE sessions SET finished_at = ?, updated_at = ? WHERE id = ?').run(now, now, sessionId);

        return json({ success: true });
    } catch (error) {
        console.error('Error finishing session:', error);
        return json({ error: 'Failed to finish session' }, { status: 500 });
    }
};
