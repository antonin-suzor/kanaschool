import type { D1Database } from '@cloudflare/workers-types';

export type AuthUser = {
    id: number;
    name: string;
    is_public: boolean;
};

export type User = {
    id: number;
    name: string;
    password_hash: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type Session = {
    id: number;
    user_id: number;
    is_public: boolean;
    hiragana: number;
    katakana: number;
    mods: number;
    mult: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    finished_at: string | null;
};

export type Kana = {
    id: number;
    reading: string;
    is_katakana: boolean;
    mod: number;
    consonant_line: string;
    vowel_column: string;
    unicode: string;
};

export type SessionKana = {
    id: number;
    session_id: number;
    kana_id: number;
    mult_position: number;
    submitted_at: string;
    is_correct: boolean;
};

// User queries
export async function getUserById(db: D1Database, id: number): Promise<AuthUser | null> {
    const result = await db
        .prepare('SELECT id, name, is_public FROM users WHERE id = ? AND deleted_at IS NULL')
        .bind(id)
        .first<Omit<AuthUser, 'is_public'> & { is_public: number }>();

    if (!result) return null;

    return {
        ...result,
        is_public: Boolean(result.is_public),
    };
}

export async function getUserByName(db: D1Database, name: string): Promise<AuthUser | null> {
    const result = await db
        .prepare('SELECT id, name, is_public FROM users WHERE name = ? AND deleted_at IS NULL')
        .bind(name)
        .first<Omit<AuthUser, 'is_public'> & { is_public: number }>();

    if (!result) return null;

    return {
        ...result,
        is_public: Boolean(result.is_public),
    };
}

export async function getUserWithPassword(
    db: D1Database,
    name: string
): Promise<(AuthUser & { password_hash: string }) | null> {
    const result = await db
        .prepare('SELECT id, name, is_public, password_hash FROM users WHERE name = ? AND deleted_at IS NULL')
        .bind(name)
        .first<
            Omit<AuthUser, 'is_public'> & {
                is_public: number;
                password_hash: string;
            }
        >();

    if (!result) return null;

    return {
        ...result,
        is_public: Boolean(result.is_public),
    };
}

export async function getUserPasswordHash(
    db: D1Database,
    userId: number
): Promise<{ id: number; password_hash: string } | null> {
    return db
        .prepare('SELECT id, password_hash FROM users WHERE id = ? AND deleted_at IS NULL')
        .bind(userId)
        .first<{ id: number; password_hash: string }>();
}

export async function userExists(db: D1Database, name: string): Promise<boolean> {
    const result = await db
        .prepare('SELECT id FROM users WHERE name = ? AND deleted_at IS NULL')
        .bind(name)
        .first<{ id: number }>();

    return !!result;
}

export async function userExistsById(db: D1Database, id: number): Promise<boolean> {
    const result = await db
        .prepare('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL')
        .bind(id)
        .first<{ id: number }>();

    return !!result;
}

export async function usernameIsTaken(db: D1Database, name: string, excludeUserId?: number): Promise<boolean> {
    let query = 'SELECT id FROM users WHERE name = ? AND deleted_at IS NULL';
    const bindings: (string | number)[] = [name];

    if (excludeUserId !== undefined) {
        query += ' AND id != ?';
        bindings.push(excludeUserId);
    }

    const result = await db
        .prepare(query)
        .bind(...bindings)
        .first<{ id: number }>();

    return !!result;
}

export async function createUser(db: D1Database, name: string, passwordHash: string): Promise<AuthUser | null> {
    const now = new Date().toISOString();

    await db
        .prepare('INSERT INTO users (name, password_hash, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
        .bind(name, passwordHash, 0, now, now)
        .run();

    return getUserByName(db, name);
}

export async function updateUserPassword(db: D1Database, userId: number, newPasswordHash: string): Promise<void> {
    const now = new Date().toISOString();

    await db
        .prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
        .bind(newPasswordHash, now, userId)
        .run();
}

export async function updateUsername(db: D1Database, userId: number, newUsername: string): Promise<void> {
    const now = new Date().toISOString();

    await db.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?').bind(newUsername, now, userId).run();
}

export async function updateUserVisibility(db: D1Database, userId: number, isPublic: boolean): Promise<void> {
    const now = new Date().toISOString();

    await db
        .prepare('UPDATE users SET is_public = ?, updated_at = ? WHERE id = ?')
        .bind(isPublic ? 1 : 0, now, userId)
        .run();
}

export async function softDeleteUser(db: D1Database, userId: number): Promise<void> {
    const now = new Date().toISOString();

    await db.prepare('UPDATE users SET deleted_at = ?, updated_at = ? WHERE id = ?').bind(now, now, userId).run();
}

// Session queries
export async function getSession(db: D1Database, sessionId: number): Promise<Session | null> {
    return db.prepare('SELECT * FROM sessions WHERE id = ? AND deleted_at IS NULL').bind(sessionId).first<Session>();
}

export async function getUserSession(db: D1Database, sessionId: number, userId: number): Promise<Session | null> {
    return db
        .prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
        .bind(sessionId, userId)
        .first<Session>();
}

export async function getUserSessions(db: D1Database, userId: number): Promise<Session[]> {
    return db
        .prepare('SELECT * FROM sessions WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC')
        .bind(userId)
        .all<Session>()
        .then((result) => result.results || []);
}

export async function createSession(
    db: D1Database,
    userId: number,
    config: {
        hiragana: number;
        katakana: number;
        mods: number;
        mult: number;
    }
): Promise<number | null> {
    const now = new Date().toISOString();

    const result = await db
        .prepare(
            'INSERT INTO sessions (user_id, is_public, hiragana, katakana, mods, mult, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(userId, 0, config.hiragana, config.katakana, config.mods, config.mult, now, now)
        .run();

    return (result.meta.last_row_id as number) || null;
}

export async function finishSession(db: D1Database, sessionId: number): Promise<void> {
    const now = new Date().toISOString();

    await db
        .prepare('UPDATE sessions SET finished_at = ?, updated_at = ? WHERE id = ?')
        .bind(now, now, sessionId)
        .run();
}

export async function updateSessionVisibility(db: D1Database, sessionId: number, isPublic: boolean): Promise<void> {
    const now = new Date().toISOString();

    await db
        .prepare('UPDATE sessions SET is_public = ?, updated_at = ? WHERE id = ?')
        .bind(isPublic ? 1 : 0, now, sessionId)
        .run();
}

export async function softDeleteSession(db: D1Database, sessionId: number): Promise<void> {
    const now = new Date().toISOString();

    await db.prepare('UPDATE sessions SET deleted_at = ?, updated_at = ? WHERE id = ?').bind(now, now, sessionId).run();
}

// Kana queries
export async function getAllKanas(db: D1Database): Promise<Kana[]> {
    return db
        .prepare('SELECT * FROM kanas ORDER BY id ASC')
        .all<Kana>()
        .then((result) => result.results || []);
}

export async function getHiraganas(db: D1Database): Promise<Kana[]> {
    return db
        .prepare('SELECT * FROM kanas WHERE is_katakana = 0 ORDER BY id ASC')
        .all<Kana>()
        .then((result) => result.results || []);
}

export async function getKatakanas(db: D1Database): Promise<Kana[]> {
    return db
        .prepare('SELECT * FROM kanas WHERE is_katakana = 1 ORDER BY id ASC')
        .all<Kana>()
        .then((result) => result.results || []);
}

export async function getKanaByReading(db: D1Database, reading: string, isKatakana: boolean): Promise<Kana | null> {
    return db
        .prepare('SELECT * FROM kanas WHERE reading = ? AND is_katakana = ?')
        .bind(reading, isKatakana ? 1 : 0)
        .first<Kana>();
}

// Session kana queries
export async function recordGuess(
    db: D1Database,
    sessionId: number,
    kanaId: number,
    isCorrect: boolean,
    multPosition: number
): Promise<void> {
    const now = new Date().toISOString();

    await db
        .prepare(
            'INSERT INTO session_kanas (session_id, kana_id, mult_position, submitted_at, is_correct) VALUES (?, ?, ?, ?, ?)'
        )
        .bind(sessionId, kanaId, multPosition, now, isCorrect ? 1 : 0)
        .run();
}

export async function getSessionKanas(db: D1Database, sessionId: number): Promise<SessionKana[]> {
    return db
        .prepare('SELECT * FROM session_kanas WHERE session_id = ? ORDER BY submitted_at ASC')
        .bind(sessionId)
        .all<SessionKana>()
        .then((result) => result.results || []);
}

export async function getGuessCountForKanaInSession(
    db: D1Database,
    sessionId: number,
    kanaId: number
): Promise<number> {
    const result = await db
        .prepare('SELECT COUNT(*) as count FROM session_kanas WHERE session_id = ? AND kana_id = ?')
        .bind(sessionId, kanaId)
        .first<{ count: number }>();

    return result?.count || 0;
}

// Statistics queries
export async function getTotalUserCount(db: D1Database): Promise<number> {
    const result = await db
        .prepare('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL')
        .first<{ count: number }>();

    return result?.count || 0;
}

export async function getTotalSessionCount(db: D1Database): Promise<number> {
    const result = await db
        .prepare('SELECT COUNT(*) as count FROM sessions WHERE deleted_at IS NULL')
        .first<{ count: number }>();

    return result?.count || 0;
}

export async function getUserSessionCount(db: D1Database, userId: number): Promise<number> {
    const result = await db
        .prepare('SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND deleted_at IS NULL')
        .bind(userId)
        .first<{ count: number }>();

    return result?.count || 0;
}

export async function getSessionAnswerStats(
    db: D1Database,
    sessionId: number
): Promise<{ total: number; correct: number }> {
    const result = await db
        .prepare(
            `SELECT
            COUNT(*) as total,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM session_kanas
        WHERE session_id = ?`
        )
        .bind(sessionId)
        .first<{ total: number; correct: number }>();

    return {
        total: result?.total || 0,
        correct: result?.correct || 0,
    };
}

export async function getAllTimeAnswerStats(db: D1Database): Promise<{ total: number; correct: number }> {
    const result = await db
        .prepare(
            `SELECT
            COUNT(*) as total,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM session_kanas`
        )
        .first<{ total: number; correct: number }>();

    return {
        total: result?.total || 0,
        correct: result?.correct || 0,
    };
}

export async function getDateRangeAnswerStats(
    db: D1Database,
    startDate: string
): Promise<{ total: number; correct: number }> {
    const result = await db
        .prepare(
            `SELECT
            COUNT(*) as total,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM session_kanas
        WHERE submitted_at >= ?`
        )
        .bind(startDate)
        .first<{ total: number; correct: number }>();

    return {
        total: result?.total || 0,
        correct: result?.correct || 0,
    };
}

export async function getUserAnswerStats(db: D1Database, userId: number): Promise<{ total: number; correct: number }> {
    const result = await db
        .prepare(
            `SELECT
            COUNT(*) as total,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM session_kanas
        WHERE session_id IN (
            SELECT id FROM sessions WHERE user_id = ? AND deleted_at IS NULL
        )`
        )
        .bind(userId)
        .first<{ total: number; correct: number }>();

    return {
        total: result?.total || 0,
        correct: result?.correct || 0,
    };
}

export async function getUserDateRangeAnswerStats(
    db: D1Database,
    userId: number,
    startDate: string
): Promise<{ total: number; correct: number }> {
    const result = await db
        .prepare(
            `SELECT
            COUNT(*) as total,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM session_kanas
        WHERE session_id IN (
            SELECT id FROM sessions WHERE user_id = ? AND deleted_at IS NULL AND created_at >= ?
        )`
        )
        .bind(userId, startDate)
        .first<{ total: number; correct: number }>();

    return {
        total: result?.total || 0,
        correct: result?.correct || 0,
    };
}

export async function getKanaRatioStats(db: D1Database): Promise<{ hiragana_count: number; katakana_count: number }> {
    const result = await db
        .prepare(
            `SELECT
            COUNT(CASE WHEN k.is_katakana = 0 THEN 1 END) as hiragana_count,
            COUNT(CASE WHEN k.is_katakana = 1 THEN 1 END) as katakana_count
        FROM session_kanas sk
        JOIN kanas k ON sk.kana_id = k.id`
        )
        .first<{ hiragana_count: number; katakana_count: number }>();

    return {
        hiragana_count: result?.hiragana_count || 0,
        katakana_count: result?.katakana_count || 0,
    };
}

export async function getDiacriticsRatioStats(
    db: D1Database
): Promise<{ no_diacritics_count: number; diacritics_count: number }> {
    const result = await db
        .prepare(
            `SELECT
            COUNT(CASE WHEN k.mod = 0 THEN 1 END) as no_diacritics_count,
            COUNT(CASE WHEN k.mod > 0 THEN 1 END) as diacritics_count
        FROM session_kanas sk
        JOIN kanas k ON sk.kana_id = k.id`
        )
        .first<{ no_diacritics_count: number; diacritics_count: number }>();

    return {
        no_diacritics_count: result?.no_diacritics_count || 0,
        diacritics_count: result?.diacritics_count || 0,
    };
}

export async function getUserPublicProfile(
    db: D1Database,
    name: string
): Promise<(Omit<AuthUser, 'is_public'> & { is_public: number; created_at: string; updated_at: string }) | null> {
    return db
        .prepare('SELECT id, name, is_public, created_at, updated_at FROM users WHERE name = ? AND deleted_at IS NULL')
        .bind(name)
        .first<Omit<AuthUser, 'is_public'> & { is_public: number; created_at: string; updated_at: string }>();
}

export async function getUserSessionsWithStats(
    db: D1Database,
    userId: number,
    limit: number = 10,
    offset: number = 0,
    isOwnProfile: boolean = true
): Promise<
    Array<{
        id: number;
        hiragana: number;
        katakana: number;
        mods: number;
        mult: number;
        is_public: number;
        created_at: string;
        finished_at: string | null;
        total_guesses: number;
        correct_guesses: number;
    }>
> {
    let query = `SELECT
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
        WHERE s.user_id = ? AND s.deleted_at IS NULL`;

    const params: (string | number | boolean)[] = [userId];

    if (!isOwnProfile) {
        query += ` AND s.is_public = 1`;
    }

    query += `
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?`;

    params.push(limit, offset);

    return db
        .prepare(query)
        .bind(...params)
        .all<{
            id: number;
            hiragana: number;
            katakana: number;
            mods: number;
            mult: number;
            is_public: number;
            created_at: string;
            finished_at: string | null;
            total_guesses: number;
            correct_guesses: number;
        }>()
        .then((result) => result.results || []);
}

export async function getRemainingKanasForSession(
    db: D1Database,
    sessionId: number,
    session: Session
): Promise<Kana[]> {
    return db
        .prepare(
            `SELECT k.* FROM kanas k
        WHERE
            ((k.is_katakana = 0 AND ? = 1) OR
            (k.is_katakana = 1 AND ? = 1))
        AND (k.mod = 0 OR (k.mod > 0 AND ? = 1))
        AND (
            k.id NOT IN (
                SELECT kana_id FROM session_kanas
                WHERE session_id = ?
            )
            OR k.id IN (
                SELECT kana_id FROM session_kanas
                WHERE session_id = ?
                GROUP BY kana_id
                HAVING COUNT(*) < ?
            )
        )
        ORDER BY RANDOM()`
        )
        .bind(session.hiragana, session.katakana, session.mods, sessionId, sessionId, session.mult)
        .all<Kana>()
        .then((result) => result.results || []);
}

export async function getSessionGuessedKanas(
    db: D1Database,
    sessionId: number
): Promise<Array<Kana & { is_correct: number }>> {
    return db
        .prepare(
            `SELECT k.*, sk.is_correct
        FROM session_kanas sk
        JOIN kanas k ON sk.kana_id = k.id
        WHERE sk.session_id = ?
        ORDER BY sk.submitted_at ASC`
        )
        .bind(sessionId)
        .all<Kana & { is_correct: number }>()
        .then((result) => result.results || []);
}

export async function getUsersCreatedSinceDate(db: D1Database, startDate: string): Promise<number> {
    const result = await db
        .prepare('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL AND created_at >= ?')
        .bind(startDate)
        .first<{ count: number }>();

    return result?.count || 0;
}

export async function getSessionsCreatedSinceDate(db: D1Database, startDate: string): Promise<number> {
    const result = await db
        .prepare('SELECT COUNT(*) as count FROM sessions WHERE deleted_at IS NULL AND created_at >= ?')
        .bind(startDate)
        .first<{ count: number }>();

    return result?.count || 0;
}

export async function getAverageSessionsPerUser(db: D1Database): Promise<number> {
    const result = await db
        .prepare(
            `SELECT AVG(session_count) as average
        FROM (
            SELECT COUNT(*) as session_count
            FROM sessions
            WHERE deleted_at IS NULL
            GROUP BY user_id
        )`
        )
        .first<{ average: number | null }>();

    return result?.average ? Math.round(result.average * 100) / 100 : 0;
}

export async function getMaxSessionsForAnyUser(db: D1Database): Promise<number> {
    const result = await db
        .prepare(
            `SELECT MAX(session_count) as max
        FROM (
            SELECT COUNT(*) as session_count
            FROM sessions
            WHERE deleted_at IS NULL
            GROUP BY user_id
        )`
        )
        .first<{ max: number | null }>();

    return result?.max || 0;
}

export async function getUserUnfinishedSessions(db: D1Database, userId: number): Promise<Session[]> {
    return db
        .prepare(
            `SELECT * FROM sessions
        WHERE user_id = ? AND deleted_at IS NULL AND finished_at IS NULL
        ORDER BY updated_at DESC
        LIMIT 10`
        )
        .bind(userId)
        .all<Session>()
        .then((result) => result.results || []);
}

export async function getUserFinishedSessions(db: D1Database, userId: number): Promise<Session[]> {
    return db
        .prepare(
            `SELECT * FROM sessions
        WHERE user_id = ? AND deleted_at IS NULL AND finished_at IS NOT NULL
        ORDER BY updated_at DESC
        LIMIT 10`
        )
        .bind(userId)
        .all<Session>()
        .then((result) => result.results || []);
}

export async function getFinishedSessionCount(db: D1Database, userId: number): Promise<number> {
    const result = await db
        .prepare(
            'SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND deleted_at IS NULL AND finished_at IS NOT NULL'
        )
        .bind(userId)
        .first<{ count: number }>();

    return result?.count || 0;
}
