import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import * as db from '$lib/db';

export const POST: RequestHandler = async ({ request, params, locals, platform }) => {
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

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { kanaId, isCorrect } = body;

    try {
        // Verify session ownership
        const session = await db.getUserSession(platform.env.D1_DB, sessionId, locals.user.id);

        if (!session) {
            return json({ error: 'Session not found' }, { status: 404 });
        }

        // Calculate mult_position: count how many times this kana has been guessed in this session
        const previousGuesses = await db.getGuessCountForKanaInSession(platform.env.D1_DB, sessionId, kanaId);

        const multPosition = previousGuesses + 1;

        await db.recordGuess(platform.env.D1_DB, sessionId, kanaId, isCorrect, multPosition);

        return json({ success: true });
    } catch (error) {
        console.error('Error recording guess:', error);
        return json({ error: 'Failed to record guess' }, { status: 500 });
    }
};
