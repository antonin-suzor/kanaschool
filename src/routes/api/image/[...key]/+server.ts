import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

// Cache user-uploaded images for 1 hour on the client, 1 day on the CDN edge.
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400';

export const GET: RequestHandler = async ({ params, platform }) => {
    if (!platform?.env.R2_BUCKET) {
        error(500, 'Storage not available');
    }

    const key = params.key;
    if (!key) {
        error(400, 'Missing image key');
    }

    // Prevent path traversal: keys must start with the users/ prefix and
    // must not contain any ../ sequences.
    if (!key.startsWith('users/') || key.includes('..')) {
        error(403, 'Forbidden');
    }

    const object = await platform.env.R2_BUCKET.get(key);

    if (!object) {
        error(404, 'Image not found');
    }

    const contentType = object.httpMetadata?.contentType ?? 'application/octet-stream';

    const headers = new Headers({
        'content-type': contentType,
        'cache-control': CACHE_CONTROL,
        etag: object.etag,
    });

    if (object.size !== undefined) {
        headers.set('content-length', String(object.size));
    }

    return new Response(object.body as ReadableStream, { headers });
};
