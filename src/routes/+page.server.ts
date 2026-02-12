import { getDb } from '$lib/db';

export function load() {
    const db = getDb();

    // All-time stats
    const totalUsers = db.query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL').get() as {
        count: number;
    };

    const totalSessions = db.query('SELECT COUNT(*) as count FROM sessions WHERE deleted_at IS NULL').get() as {
        count: number;
    };

    const allTimeCorrectAnswers = db
        .query(
            `SELECT 
            COUNT(CASE WHEN is_correct = 1 THEN 1 END) as correct,
            COUNT(*) as total
        FROM session_kanas`
        )
        .get() as { correct: number; total: number };

    const allTimeCorrectPercentage =
        allTimeCorrectAnswers.total > 0
            ? Math.round((allTimeCorrectAnswers.correct / allTimeCorrectAnswers.total) * 100)
            : 0;

    // Last month stats
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoStr = oneMonthAgo.toISOString();

    const usersLastMonth = db
        .query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL AND created_at >= ?')
        .get(oneMonthAgoStr) as { count: number };

    const sessionsLastMonth = db
        .query('SELECT COUNT(*) as count FROM sessions WHERE deleted_at IS NULL AND created_at >= ?')
        .get(oneMonthAgoStr) as { count: number };

    const lastMonthCorrectAnswers = db
        .query(
            `SELECT 
            COUNT(CASE WHEN is_correct = 1 THEN 1 END) as correct,
            COUNT(*) as total
        FROM session_kanas sk
        WHERE sk.submitted_at >= ?`
        )
        .get(oneMonthAgoStr) as { correct: number; total: number };

    const lastMonthCorrectPercentage =
        lastMonthCorrectAnswers.total > 0
            ? Math.round((lastMonthCorrectAnswers.correct / lastMonthCorrectAnswers.total) * 100)
            : 0;

    return {
        stats: {
            allTime: {
                userCount: totalUsers.count,
                sessionCount: totalSessions.count,
                correctPercentage: allTimeCorrectPercentage,
            },
            lastMonth: {
                accountsCreated: usersLastMonth.count,
                sessionCount: sessionsLastMonth.count,
                correctPercentage: lastMonthCorrectPercentage,
            },
        },
    };
}
