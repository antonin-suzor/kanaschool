import * as db from '$lib/db';

export async function load({ platform }) {
    if (!platform?.env.D1_DB) {
        return {
            stats: {
                sessions: {
                    total: 0,
                    lastMonth: 0,
                },
                correctAnswers: {
                    allTime: 0,
                    lastMonth: 0,
                },
                kanaRatio: {
                    hiragana: 0,
                    katakana: 0,
                },
                diacriticsRatio: {
                    diacritics: 0,
                    noDiacritics: 0,
                },
            },
        };
    }

    const database = platform.env.D1_DB;

    // All-time sessions count
    const totalSessions = await db.getTotalSessionCount(database);

    // Sessions started in the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoStr = oneMonthAgo.toISOString();

    const sessionsLastMonth = await db.getSessionsCreatedSinceDate(database, oneMonthAgoStr);

    // Percentage of good answers (all-time)
    const allTimeAnswers = await db.getAllTimeAnswerStats(database);
    const allTimeCorrectPercentage =
        allTimeAnswers.total > 0 ? Math.round((allTimeAnswers.correct / allTimeAnswers.total) * 100) : 0;

    // Percentage of good answers (last month)
    const lastMonthAnswers = await db.getDateRangeAnswerStats(database, oneMonthAgoStr);
    const lastMonthCorrectPercentage =
        lastMonthAnswers.total > 0 ? Math.round((lastMonthAnswers.correct / lastMonthAnswers.total) * 100) : 0;

    // Hiragana/Katakana ratio
    const kanaRatio = await db.getKanaRatioStats(database);
    const totalKanaAnswers = kanaRatio.hiragana_count + kanaRatio.katakana_count;
    const hiraganaPercentage =
        totalKanaAnswers > 0 ? Math.round((kanaRatio.hiragana_count / totalKanaAnswers) * 100) : 0;
    const katakanaPercentage =
        totalKanaAnswers > 0 ? Math.round((kanaRatio.katakana_count / totalKanaAnswers) * 100) : 0;

    // Diacritics/No-diacritics ratio
    const diacriticsRatio = await db.getDiacriticsRatioStats(database);
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
                total: totalSessions,
                lastMonth: sessionsLastMonth,
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
