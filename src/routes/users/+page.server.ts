import { getDb } from '$lib/db';

export function load() {
    const db = getDb();

    // Total number of users
    const totalUsers = db.query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL').get() as {
        count: number;
    };

    // Users signed up in the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoStr = oneMonthAgo.toISOString();

    const usersLastMonth = db
        .query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL AND created_at >= ?')
        .get(oneMonthAgoStr) as { count: number };

    // Average number of sessions per user
    const avgSessions = db
        .query(
            `SELECT AVG(session_count) as average
        FROM (
            SELECT COUNT(*) as session_count
            FROM sessions
            WHERE deleted_at IS NULL
            GROUP BY user_id
        )`
        )
        .get() as { average: number | null };

    const averageSessionsPerUser = avgSessions.average ? Math.round(avgSessions.average * 100) / 100 : 0;

    // Max number of sessions for any user
    const maxSessions = db
        .query(
            `SELECT MAX(session_count) as max
        FROM (
            SELECT COUNT(*) as session_count
            FROM sessions
            WHERE deleted_at IS NULL
            GROUP BY user_id
        )`
        )
        .get() as { max: number | null };

    const maxSessionsForUser = maxSessions.max || 0;

    return {
        stats: {
            totalUsers: totalUsers.count,
            usersLastMonth: usersLastMonth.count,
            averageSessionsPerUser,
            maxSessionsForUser,
        },
    };
}
