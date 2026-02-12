import { getDb } from '$lib/db';
import type { Kana } from '$lib/types';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const db = getDb();

    const kana = db.query('SELECT * FROM kanas WHERE reading = ? AND is_katakana = 0').get(params.reading) as
        | Kana
        | undefined;

    if (!kana) {
        error(404, 'Hiragana not found');
    }

    // For "ji" reading, get both the chi and shi variants
    let alternativeKana: Kana | undefined;
    if (kana.reading === 'ji') {
        alternativeKana = db
            .query("SELECT * FROM kanas WHERE reading = ? AND is_katakana = 0 AND consonant_line = 't'")
            .get('ji') as Kana | undefined;
    }

    return {
        kana,
        alternativeKana,
    };
}
