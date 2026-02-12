import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Not authenticated');
    }

    const db = getDb();

    // Get unfinished sessions
    const unfinishedSessions = db
        .query(
            `
        SELECT * FROM sessions 
        WHERE user_id = ? AND deleted_at IS NULL AND finished_at IS NULL
        ORDER BY updated_at DESC
        LIMIT 10
    `
        )
        .all(locals.user.id) as any[];

    // Get finished sessions
    const finishedSessions = db
        .query(
            `
        SELECT * FROM sessions 
        WHERE user_id = ? AND deleted_at IS NULL AND finished_at IS NOT NULL
        ORDER BY updated_at DESC
        LIMIT 10
    `
        )
        .all(locals.user.id) as any[];

    // Calculate statistics for each session
    const enrichSessions = (sessions: any[]) => {
        return sessions.map((session) => {
            const stats = db
                .query(
                    `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
                FROM session_kanas
                WHERE session_id = ?
            `
                )
                .get(session.id) as { total: number; correct: number };

            const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

            return {
                ...session,
                percentage,
                lastInteraction: session.updated_at,
                isFinished: !!session.finished_at,
            };
        });
    };

    return {
        unfinishedSessions: enrichSessions(unfinishedSessions),
        finishedSessions: enrichSessions(finishedSessions),
    };
};
