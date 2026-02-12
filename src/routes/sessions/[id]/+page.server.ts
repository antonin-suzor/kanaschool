import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/db';

export const load: PageServerLoad = async ({ params, locals }) => {
    const sessionId = parseInt(params.id, 10);
    if (isNaN(sessionId)) {
        throw error(400, 'Invalid session ID');
    }

    const db = getDb();

    // Get session
    const session = db.query('SELECT * FROM sessions WHERE id = ? AND deleted_at IS NULL').get(sessionId) as any;

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
        remainingKanas = db
            .query(
                `
            SELECT k.* FROM kanas k
            WHERE
                ((k.is_katakana = 0 AND ? = 1) OR
                (k.is_katakana = 1 AND ? = 1))
            AND (k.mod = 0 OR (k.mod > 0 AND ? = 1))
            AND (
                k.id NOT IN (
                    SELECT kana_id FROM session_kanas
                    WHERE session_id = ?
                )
                OR k.id IN (
                    SELECT kana_id FROM session_kanas
                    WHERE session_id = ?
                    GROUP BY kana_id
                    HAVING COUNT(*) < ?
                )
            )
            ORDER BY RANDOM()
        `
            )
            .all(session.hiragana, session.katakana, session.mods, sessionId, sessionId, session.mult) as any[];
    }

    // Get already guessed kanas with their results
    const guessedKanas = db
        .query(
            `
        SELECT k.*, sk.is_correct
        FROM session_kanas sk
        JOIN kanas k ON sk.kana_id = k.id
        WHERE sk.session_id = ?
        ORDER BY sk.submitted_at ASC
    `
        )
        .all(sessionId) as any[];

    return {
        session,
        remainingKanas,
        guessedKanas,
        multiplier: session.mult,
        isFinished,
        isOwner,
    };
};
