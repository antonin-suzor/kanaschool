import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/db';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    let sessionConfig;
    try {
        sessionConfig = await request.json();
    } catch {
        return json({ error: 'Invalid request body' }, { status: 400 });
    }

    let { hiragana = 1, katakana = 1, mods = 1, mult = 1 } = sessionConfig;

    // Ensure numeric values
    hiragana = Number(hiragana);
    katakana = Number(katakana);
    mods = Number(mods);
    mult = Number(mult);

    const db = getDb();
    const now = new Date().toISOString();

    try {
        const result = db
            .prepare(
                'INSERT INTO sessions (user_id, is_public, hiragana, katakana, mods, mult, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            )
            .run(locals.user.id, 0, hiragana, katakana, mods, mult, now, now);

        const sessionId = result.lastInsertRowid;

        return json({ sessionId });
    } catch (error) {
        console.error('Error creating session:', error);
        return json({ error: 'Failed to create session' }, { status: 500 });
    }
};
