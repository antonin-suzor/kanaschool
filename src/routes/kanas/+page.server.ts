import { getDb } from '$lib/db';
import type { Kana } from '$lib/types';

export async function load() {
    const db = getDb();

    const hiraganas = db.query('SELECT * FROM kanas WHERE is_katakana = 0 ORDER BY id ASC').all() as Kana[];

    const katakanas = db.query('SELECT * FROM kanas WHERE is_katakana = 1 ORDER BY id ASC').all() as Kana[];

    return {
        hiraganas,
        katakanas,
    };
}
