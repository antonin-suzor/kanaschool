import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as db from '$lib/db';

export const load: PageServerLoad = async ({ locals, platform }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    if (!platform?.env.D1_DB) {
        throw error(500, 'Database not available');
    }

    const profile = await db.getUserPublicProfile(platform.env.D1_DB, locals.user.name);

    if (!profile) {
        throw error(404, 'User not found');
    }

    return {
        user: locals.user,
        profile,
    };
};
