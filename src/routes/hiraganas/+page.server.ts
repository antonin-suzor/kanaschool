import * as db from '$lib/db';
import type { Kana } from '$lib/types';

export async function load({ platform }) {
    if (!platform?.env.D1_DB) {
        return {
            kanas: [],
        };
    }

    const kanas = await db.getHiraganas(platform.env.D1_DB);

    return {
        kanas,
    };
}
