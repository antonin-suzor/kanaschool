import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as db from '$lib/db';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
    const sessionId = parseInt(params.id, 10);
    if (isNaN(sessionId)) {
        throw error(400, 'Invalid session ID');
    }

    if (!platform?.env.D1_DB) {
        throw error(500, 'Database not available');
    }

    const database = platform.env.D1_DB;

    // Get session
    const session = await db.getSession(database, sessionId);

    if (!session) {
        throw error(404, 'Session not found');
    }

    // Check permissions:
    // - If session is ongoing (not finished), only owner can view
    // - If session is finished and public, anyone can view
    // - If session is finished and private, only owner can view
    const isOwner = locals.user?.id === session.user_id;
    const isFinished = !!session.finished_at;
    const isPublic = !!session.is_public;

    if (!isFinished && !isOwner) {
        throw error(403, 'Cannot view ongoing sessions that are not yours');
    }

    if (isFinished && !isPublic && !isOwner) {
        throw error(403, 'This session is private');
    }

    // Get remaining kanas for this session (only if not finished)
    let remainingKanas: any[] = [];
    if (!isFinished) {
        const rawKanas = await db.getRemainingKanasForSession(database, sessionId, session);
        remainingKanas = rawKanas.map((k) => ({
            ...k,
            is_katakana: Boolean(k.is_katakana),
        })) as any[];
    }

    // Get already guessed kanas with their results
    const rawGuessedKanas = await db.getSessionGuessedKanas(database, sessionId);
    const guessedKanas = rawGuessedKanas.map((k) => ({
        ...k,
        is_katakana: Boolean(k.is_katakana),
    })) as any[];

    return {
        session,
        remainingKanas,
        guessedKanas,
        multiplier: session.mult,
        isFinished,
        isOwner,
    };
};
