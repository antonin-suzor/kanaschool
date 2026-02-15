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

    const database = platform.env.D1_DB;

    try {
        const sessionId = await db.createSession(database, locals.user.id, {
            hiragana,
            katakana,
            mods,
            mult,
        });

        if (!sessionId) {
            return json({ error: 'Failed to create session' }, { status: 500 });
        }

        return json({ sessionId });
    } catch (error) {
        console.error('Error creating session:', error);
        return json({ error: 'Failed to create session' }, { status: 500 });
    }
};
