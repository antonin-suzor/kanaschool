import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db';

export const POST: RequestHandler = async ({ request, params, locals }) => {
    if (!locals.user) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionId = parseInt(params.id || '', 10);
    if (isNaN(sessionId)) {
        return json({ error: 'Invalid session ID' }, { status: 400 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { kanaId, isCorrect } = body;

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

        // Calculate mult_position: count how many times this kana has been guessed in this session
        const previousGuesses = db
            .query('SELECT COUNT(*) as count FROM session_kanas WHERE session_id = ? AND kana_id = ?')
            .get(sessionId, kanaId) as { count: number };

        const multPosition = previousGuesses.count + 1;

        db.prepare(
            'INSERT INTO session_kanas (session_id, kana_id, mult_position, submitted_at, is_correct) VALUES (?, ?, ?, ?, ?)'
        ).run(sessionId, kanaId, multPosition, now, isCorrect ? 1 : 0);

        return json({ success: true });
    } catch (error) {
        console.error('Error recording guess:', error);
        return json({ error: 'Failed to record guess' }, { status: 500 });
    }
};
