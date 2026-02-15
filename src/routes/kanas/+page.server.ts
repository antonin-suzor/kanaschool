import * as db from '$lib/db';
import type { Kana } from '$lib/types';

export async function load({ platform }) {
    if (!platform?.env.D1_DB) {
        return {
            hiraganas: [],
            katakanas: [],
        };
    }

    const hiraganas = await db.getHiraganas(platform.env.D1_DB);
    const katakanas = await db.getKatakanas(platform.env.D1_DB);

    return {
        hiraganas: hiraganas as Kana[],
        katakanas: katakanas as Kana[],
    };
}
