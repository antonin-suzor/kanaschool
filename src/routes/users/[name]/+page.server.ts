import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/db';

export const load: PageServerLoad = async ({ params, locals }) => {
    const username = params.name;
    const db = getDb();

    // Get the user
    const user = db
        .query('SELECT id, name, is_public, created_at, updated_at FROM users WHERE name = ? AND deleted_at IS NULL')
        .get(username) as any;

    if (!user) {
        throw error(404, 'User not found');
    }

    // Allow viewing if the profile is public OR if the current user is viewing their own profile
    const isOwnProfile = locals.user?.id === user.id;
    if (user.is_public === 0 && !isOwnProfile) {
        throw error(404, 'User profile is private');
    }

    // Get user statistics
    const totalSessions = db
        .query('SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND deleted_at IS NULL')
        .get(user.id) as { count: number };

    const finishedSessions = db
        .query(
            'SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND deleted_at IS NULL AND finished_at IS NOT NULL'
        )
        .get(user.id) as { count: number };

    // All-time correctness
    const allTimeStats = db
        .query(
            `
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM session_kanas
        WHERE session_id IN (
            SELECT id FROM sessions WHERE user_id = ? AND deleted_at IS NULL
        )
    `
        )
        .get(user.id) as { total: number; correct: number };

    const allTimePercentage =
        allTimeStats.total > 0 ? Math.round((allTimeStats.correct / allTimeStats.total) * 100) : 0;

    // Last 30 days statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    const lastMonthStats = db
        .query(
            `
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM session_kanas
        WHERE session_id IN (
            SELECT id FROM sessions WHERE user_id = ? AND deleted_at IS NULL AND created_at >= ?
        )
    `
        )
        .get(user.id, thirtyDaysAgoISO) as { total: number; correct: number };

    const lastMonthPercentage =
        lastMonthStats.total > 0 ? Math.round((lastMonthStats.correct / lastMonthStats.total) * 100) : 0;

    // Get paginated sessions (most recent first, 10 per page)
    const page = 0;
    const limit = 10;
    const offset = page * limit;

    let sessionQuery = `
        SELECT
            s.id,
            s.hiragana,
            s.katakana,
            s.mods,
            s.mult,
            s.is_public,
            s.created_at,
            s.finished_at,
            COUNT(sk.id) as total_guesses,
            SUM(CASE WHEN sk.is_correct = 1 THEN 1 ELSE 0 END) as correct_guesses
        FROM sessions s
        LEFT JOIN session_kanas sk ON s.id = sk.session_id
        WHERE s.user_id = ? AND s.deleted_at IS NULL
    `;

    // If not viewing own profile, only show finished public sessions
    if (!isOwnProfile) {
        sessionQuery += ` AND s.is_public = 1`;
    }

    sessionQuery += `
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?
    `;

    const sessions = db.query(sessionQuery).all(user.id, limit, offset) as any[];

    const sessionList = sessions.map((s) => ({
        id: s.id,
        hiragana: s.hiragana,
        katakana: s.katakana,
        mods: s.mods,
        mult: s.mult,
        is_public: s.is_public,
        created_at: s.created_at,
        finished_at: s.finished_at,
        percentage: s.total_guesses > 0 ? Math.round((s.correct_guesses / s.total_guesses) * 100) : 0,
        isFinished: s.finished_at !== null,
    }));

    return {
        user,
        stats: {
            totalSessions: totalSessions.count,
            finishedSessions: finishedSessions.count,
            allTimePercentage,
            lastMonthPercentage,
        },
        sessions: sessionList,
        isOwnProfile,
    };
};
