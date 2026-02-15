import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as db from '$lib/db';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
    if (!platform?.env.D1_DB) {
        throw error(500, 'Database not available');
    }

    const username = params.name;
    const database = platform.env.D1_DB;

    // Get the user
    const user = await db.getUserPublicProfile(database, username);

    if (!user) {
        throw error(404, 'User not found');
    }

    // Allow viewing if the profile is public OR if the current user is viewing their own profile
    const isOwnProfile = locals.user?.id === user.id;
    if (user.is_public === 0 && !isOwnProfile) {
        throw error(404, 'User profile is private');
    }

    // Get user statistics
    const totalSessions = await db.getUserSessionCount(database, user.id);
    const finishedSessions = await db.getFinishedSessionCount(database, user.id);

    // All-time correctness
    const allTimeStats = await db.getUserAnswerStats(database, user.id);

    const allTimePercentage =
        allTimeStats.total > 0 ? Math.round((allTimeStats.correct / allTimeStats.total) * 100) : 0;

    // Last 30 days statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    const lastMonthStats = await db.getUserDateRangeAnswerStats(database, user.id, thirtyDaysAgoISO);

    const lastMonthPercentage =
        lastMonthStats.total > 0 ? Math.round((lastMonthStats.correct / lastMonthStats.total) * 100) : 0;

    // Get paginated sessions (most recent first, 10 per page)
    const page = 0;
    const limit = 10;
    const offset = page * limit;

    const sessions = await db.getUserSessionsWithStats(database, user.id, limit, offset, isOwnProfile);

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
            totalSessions,
            finishedSessions,
            allTimePercentage,
            lastMonthPercentage,
        },
        sessions: sessionList,
        isOwnProfile,
    };
};
