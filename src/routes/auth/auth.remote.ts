import { command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { login, signup } from '$lib/auth';
import * as v from 'valibot';

const LoginSchema = v.object({
    name: v.string(),
    password: v.string(),
});

const SignupSchema = v.object({
    name: v.string(),
    password: v.string(),
});

export const loginUser = command(LoginSchema, async ({ name, password }) => {
    const event = getRequestEvent();

    if (!event.platform?.env.D1_DB) {
        throw new Error('Database not available');
    }

    const result = await login(event.platform.env.D1_DB, name, password);

    if ('error' in result) {
        throw new Error(result.error);
    }

    event.cookies.set('auth', JSON.stringify(result.user), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return result.user;
});

export const signupUser = command(SignupSchema, async ({ name, password }) => {
    const event = getRequestEvent();

    if (!event.platform?.env.D1_DB) {
        throw new Error('Database not available');
    }

    const result = await signup(event.platform.env.D1_DB, name, password);

    if ('error' in result) {
        throw new Error(result.error);
    }

    event.cookies.set('auth', JSON.stringify(result.user), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return result.user;
});

export const logoutUser = command(async () => {
    const event = getRequestEvent();
    event.cookies.delete('auth', { path: '/' });
});
