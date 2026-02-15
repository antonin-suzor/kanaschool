import * as db from '$lib/db';

export async function load({ platform }) {
    if (!platform?.env.D1_DB) {
        return {
            stats: {
                allTime: {
                    userCount: 0,
                    sessionCount: 0,
                    correctPercentage: 0,
                },
                lastMonth: {
                    accountsCreated: 0,
                    sessionCount: 0,
                    correctPercentage: 0,
                },
            },
        };
    }

    const database = platform.env.D1_DB;

    // All-time stats
    const totalUsers = await db.getTotalUserCount(database);
    const totalSessions = await db.getTotalSessionCount(database);
    const allTimeCorrectAnswers = await db.getAllTimeAnswerStats(database);

    const allTimeCorrectPercentage =
        allTimeCorrectAnswers.total > 0
            ? Math.round((allTimeCorrectAnswers.correct / allTimeCorrectAnswers.total) * 100)
            : 0;

    // Last month stats
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoStr = oneMonthAgo.toISOString();

    const usersLastMonth = await db.getUsersCreatedSinceDate(database, oneMonthAgoStr);
    const sessionsLastMonth = await db.getSessionsCreatedSinceDate(database, oneMonthAgoStr);
    const lastMonthCorrectAnswers = await db.getDateRangeAnswerStats(database, oneMonthAgoStr);

    const lastMonthCorrectPercentage =
        lastMonthCorrectAnswers.total > 0
            ? Math.round((lastMonthCorrectAnswers.correct / lastMonthCorrectAnswers.total) * 100)
            : 0;

    return {
        stats: {
            allTime: {
                userCount: totalUsers,
                sessionCount: totalSessions,
                correctPercentage: allTimeCorrectPercentage,
            },
            lastMonth: {
                accountsCreated: usersLastMonth,
                sessionCount: sessionsLastMonth,
                correctPercentage: lastMonthCorrectPercentage,
            },
        },
    };
}
