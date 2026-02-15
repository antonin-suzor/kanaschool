import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as db from '$lib/db';

export const load: PageServerLoad = async ({ locals, platform }) => {
    if (!locals.user) {
        throw error(401, 'Not authenticated');
    }

    if (!platform?.env.D1_DB) {
        throw error(500, 'Database not available');
    }

    const database = platform.env.D1_DB;

    // Get unfinished sessions
    const unfinishedSessions = await db.getUserUnfinishedSessions(database, locals.user.id);

    // Get finished sessions
    const finishedSessions = await db.getUserFinishedSessions(database, locals.user.id);

    // Calculate statistics for each session
    const enrichSessions = async (sessions: any[]) => {
        const enriched = [];
        for (const session of sessions) {
            const stats = await db.getSessionAnswerStats(database, session.id);

            const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

            enriched.push({
                ...session,
                percentage,
                lastInteraction: session.updated_at,
                isFinished: !!session.finished_at,
            });
        }
        return enriched;
    };

    return {
        unfinishedSessions: await enrichSessions(unfinishedSessions),
        finishedSessions: await enrichSessions(finishedSessions),
    };
};
