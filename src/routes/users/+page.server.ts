import * as db from '$lib/db';

export async function load({ platform }) {
    if (!platform?.env.D1_DB) {
        return {
            stats: {
                totalUsers: 0,
                usersLastMonth: 0,
                averageSessionsPerUser: 0,
                maxSessionsForUser: 0,
            },
        };
    }

    const database = platform.env.D1_DB;

    // Total number of users
    const totalUsers = await db.getTotalUserCount(database);

    // Users signed up in the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoStr = oneMonthAgo.toISOString();

    const usersLastMonth = await db.getUsersCreatedSinceDate(database, oneMonthAgoStr);

    // Average number of sessions per user
    const averageSessionsPerUser = await db.getAverageSessionsPerUser(database);

    // Max number of sessions for any user
    const maxSessionsForUser = await db.getMaxSessionsForAnyUser(database);

    return {
        stats: {
            totalUsers,
            usersLastMonth,
            averageSessionsPerUser,
            maxSessionsForUser,
        },
    };
}
