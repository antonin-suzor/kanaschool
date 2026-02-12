// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { D1Database, CfProperties, ExecutionContext } from '@cloudflare/workers-types';
import type { AuthUser } from '$lib/types';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user?: AuthUser;
        }
        // interface PageData {}
        // interface PageState {}
        interface Platform {
            cf: CfProperties;
            ctx: ExecutionContext;
            env: {
                D1_DB: D1Database;
                DISCORD_WEBHOOK_URL: string;
            };
        }
    }
}

export {};
