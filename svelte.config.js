// NEVER RENAME SVELTE CONFIG TO TS, OR AT SOME POINT SOME BUILD WILL CRASH

import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            fallback: 'plaintext',
        }),
    },
};

export default config;
