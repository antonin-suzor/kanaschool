import { getDb } from '$lib/db';

export function load() {
    const db = getDb();

    // All-time sessions count
    const totalSessions = db.query('SELECT COUNT(*) as count FROM sessions WHERE deleted_at IS NULL').get() as {
        count: number;
    };

    // Sessions started in the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoStr = oneMonthAgo.toISOString();

    const sessionsLastMonth = db
        .query('SELECT COUNT(*) as count FROM sessions WHERE deleted_at IS NULL AND created_at >= ?')
        .get(oneMonthAgoStr) as { count: number };

    // Percentage of good answers (all-time)
    const allTimeAnswers = db
        .query(
            `SELECT 
            COUNT(CASE WHEN is_correct = 1 THEN 1 END) as correct,
            COUNT(*) as total
        FROM session_kanas`
        )
        .get() as { correct: number; total: number };

    const allTimeCorrectPercentage =
        allTimeAnswers.total > 0 ? Math.round((allTimeAnswers.correct / allTimeAnswers.total) * 100) : 0;

    // Percentage of good answers (last month)
    const lastMonthAnswers = db
        .query(
            `SELECT 
            COUNT(CASE WHEN is_correct = 1 THEN 1 END) as correct,
            COUNT(*) as total
        FROM session_kanas sk
        WHERE sk.submitted_at >= ?`
        )
        .get(oneMonthAgoStr) as { correct: number; total: number };

    const lastMonthCorrectPercentage =
        lastMonthAnswers.total > 0 ? Math.round((lastMonthAnswers.correct / lastMonthAnswers.total) * 100) : 0;

    // Hiragana/Katakana ratio
    const kanaRatio = db
        .query(
            `SELECT 
            COUNT(CASE WHEN k.is_katakana = 0 THEN 1 END) as hiragana_count,
            COUNT(CASE WHEN k.is_katakana = 1 THEN 1 END) as katakana_count
        FROM session_kanas sk
        JOIN kanas k ON sk.kana_id = k.id`
        )
        .get() as { hiragana_count: number; katakana_count: number };

    const totalKanaAnswers = kanaRatio.hiragana_count + kanaRatio.katakana_count;
    const hiraganaPercentage =
        totalKanaAnswers > 0 ? Math.round((kanaRatio.hiragana_count / totalKanaAnswers) * 100) : 0;
    const katakanaPercentage =
        totalKanaAnswers > 0 ? Math.round((kanaRatio.katakana_count / totalKanaAnswers) * 100) : 0;

    // Diacritics/No-diacritics ratio
    const diacriticsRatio = db
        .query(
            `SELECT 
            COUNT(CASE WHEN k.mod = 0 THEN 1 END) as no_diacritics_count,
            COUNT(CASE WHEN k.mod > 0 THEN 1 END) as diacritics_count
        FROM session_kanas sk
        JOIN kanas k ON sk.kana_id = k.id`
        )
        .get() as { no_diacritics_count: number; diacritics_count: number };

    const totalDiacriticsAnswers = diacriticsRatio.no_diacritics_count + diacriticsRatio.diacritics_count;
    const diacriticsPercentage =
        totalDiacriticsAnswers > 0 ? Math.round((diacriticsRatio.diacritics_count / totalDiacriticsAnswers) * 100) : 0;
    const noDiacriticsPercentage =
        totalDiacriticsAnswers > 0
            ? Math.round((diacriticsRatio.no_diacritics_count / totalDiacriticsAnswers) * 100)
            : 0;

    return {
        stats: {
            sessions: {
                total: totalSessions.count,
                lastMonth: sessionsLastMonth.count,
            },
            correctAnswers: {
                allTime: allTimeCorrectPercentage,
                lastMonth: lastMonthCorrectPercentage,
            },
            kanaRatio: {
                hiragana: hiraganaPercentage,
                katakana: katakanaPercentage,
            },
            diacriticsRatio: {
                diacritics: diacriticsPercentage,
                noDiacritics: noDiacriticsPercentage,
            },
        },
    };
}
