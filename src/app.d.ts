// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AuthUser } from '$lib/types';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user?: AuthUser;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
