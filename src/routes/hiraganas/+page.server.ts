import { getDb } from '$lib/db';
import type { Kana } from '$lib/types';

export async function load() {
    const db = getDb();

    const kanas = db.query('SELECT * FROM kanas WHERE is_katakana = 0 ORDER BY id ASC').all() as Kana[];

    return {
        kanas,
    };
}
