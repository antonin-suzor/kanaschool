import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import * as db from '$lib/db';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_KINDS = ['avatar', 'banner'] as const;

type UploadKind = (typeof ALLOWED_KINDS)[number];

export const POST: RequestHandler = async ({ request, locals, platform }) => {
    if (!locals.user) {
        error(401, 'Unauthorized');
    }

    if (!platform?.env.R2_BUCKET) {
        error(500, 'Storage not available');
    }

    if (!platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
        error(400, 'Expected multipart/form-data');
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        error(400, 'Failed to parse form data');
    }

    const kindRaw = formData.get('kind');
    if (typeof kindRaw !== 'string' || !(ALLOWED_KINDS as readonly string[]).includes(kindRaw)) {
        error(400, 'Invalid upload kind, must be "avatar" or "banner"');
    }
    const kind = kindRaw as UploadKind;

    const file = formData.get('file');
    if (!(file instanceof File)) {
        error(400, 'Missing file field');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        error(400, 'Unsupported file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    if (file.size > MAX_FILE_SIZE) {
        error(400, 'File too large. Maximum size is 5 MB');
    }

    const userId = locals.user.id;
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const key = `users/${userId}/${kind}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    await platform.env.R2_BUCKET.put(key, arrayBuffer, {
        httpMetadata: { contentType: file.type },
    });

    if (kind === 'avatar') {
        await db.updateUserAvatar(platform.env.D1_DB, userId, key);
    } else {
        await db.updateUserBanner(platform.env.D1_DB, userId, key);
    }

    return json({ key });
};

export const DELETE: RequestHandler = async ({ request, locals, platform }) => {
    if (!locals.user) {
        error(401, 'Unauthorized');
    }

    if (!platform?.env.R2_BUCKET) {
        error(500, 'Storage not available');
    }

    if (!platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    let body: { kind: string };
    try {
        body = await request.json();
    } catch {
        error(400, 'Invalid JSON body');
    }

    const { kind } = body;
    if (typeof kind !== 'string' || !(ALLOWED_KINDS as readonly string[]).includes(kind)) {
        error(400, 'Invalid kind, must be "avatar" or "banner"');
    }

    const userId = locals.user.id;

    // Find the existing key from the database before deleting
    const profile = await db.getUserPublicProfile(platform.env.D1_DB, locals.user.name);
    if (!profile) {
        error(404, 'User not found');
    }

    const existingKey = kind === 'avatar' ? profile.avatar_key : profile.banner_key;
    if (existingKey) {
        await platform.env.R2_BUCKET.delete(existingKey);
    }

    if (kind === 'avatar') {
        await db.updateUserAvatar(platform.env.D1_DB, userId, null);
    } else {
        await db.updateUserBanner(platform.env.D1_DB, userId, null);
    }

    return json({ success: true });
};
