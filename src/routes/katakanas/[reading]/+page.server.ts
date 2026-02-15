import * as db from '$lib/db';
import type { Kana } from '$lib/types';
import { error } from '@sveltejs/kit';

export async function load({ params, platform }) {
    if (!platform?.env.D1_DB) {
        throw error(500, 'Database unavailable');
    }

    const kana = await db.getKanaByReading(platform.env.D1_DB, params.reading, true);

    if (!kana) {
        throw error(404, 'Katakana not found');
    }

    // For "ji" reading, get both the chi and shi variants
    let alternativeKana: Kana | null = null;
    if (kana.reading === 'ji') {
        const jis = await db.getKatakanas(platform.env.D1_DB);
        alternativeKana = (jis.find((k) => k.reading === 'ji' && k.consonant_line === 't') as Kana) || null;
    }

    return {
        kana,
        alternativeKana,
    };
}
