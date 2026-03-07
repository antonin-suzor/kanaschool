import { command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as db from '$lib/db';
import * as v from 'valibot';
import { error } from '@sveltejs/kit';

const CreateSessionSchema = v.object({
    hiragana: v.number(),
    katakana: v.number(),
    mods: v.number(),
    mult: v.number(),
});

const GuessSchema = v.object({
    sessionId: v.number(),
    kanaId: v.number(),
    isCorrect: v.boolean(),
});

const FinishSessionSchema = v.object({
    sessionId: v.number(),
});

const VisibilitySchema = v.object({
    sessionId: v.number(),
    isPublic: v.boolean(),
});

const DeleteSessionSchema = v.object({
    sessionId: v.number(),
});

export const createSession = command(CreateSessionSchema, async ({ hiragana, katakana, mods, mult }) => {
    const event = getRequestEvent();

    if (!event.locals.user) {
        error(401, 'Not authenticated');
    }

    if (!event.platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    const sessionId = await db.createSession(event.platform.env.D1_DB, event.locals.user.id, {
        hiragana,
        katakana,
        mods,
        mult,
    });

    if (!sessionId) {
        error(500, 'Failed to create session');
    }

    return { sessionId };
});

export const recordGuess = command(GuessSchema, async ({ sessionId, kanaId, isCorrect }) => {
    const event = getRequestEvent();

    if (!event.locals.user) {
        error(401, 'Not authenticated');
    }

    if (!event.platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    const session = await db.getUserSession(event.platform.env.D1_DB, sessionId, event.locals.user.id);

    if (!session) {
        error(404, 'Session not found');
    }

    const previousGuesses = await db.getGuessCountForKanaInSession(event.platform.env.D1_DB, sessionId, kanaId);
    const multPosition = previousGuesses + 1;

    await db.recordGuess(event.platform.env.D1_DB, sessionId, kanaId, isCorrect, multPosition);
});

export const finishSession = command(FinishSessionSchema, async ({ sessionId }) => {
    const event = getRequestEvent();

    if (!event.locals.user) {
        error(401, 'Not authenticated');
    }

    if (!event.platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    const session = await db.getUserSession(event.platform.env.D1_DB, sessionId, event.locals.user.id);

    if (!session) {
        error(404, 'Session not found');
    }

    await db.finishSession(event.platform.env.D1_DB, sessionId);
});

export const updateSessionVisibility = command(VisibilitySchema, async ({ sessionId, isPublic }) => {
    const event = getRequestEvent();

    if (!event.locals.user) {
        error(401, 'Not authenticated');
    }

    if (!event.platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    const session = await db.getUserSession(event.platform.env.D1_DB, sessionId, event.locals.user.id);

    if (!session) {
        error(404, 'Session not found');
    }

    await db.updateSessionVisibility(event.platform.env.D1_DB, sessionId, isPublic);
});

export const deleteSession = command(DeleteSessionSchema, async ({ sessionId }) => {
    const event = getRequestEvent();

    if (!event.locals.user) {
        error(401, 'Not authenticated');
    }

    if (!event.platform?.env.D1_DB) {
        error(500, 'Database not available');
    }

    const session = await db.getUserSession(event.platform.env.D1_DB, sessionId, event.locals.user.id);

    if (!session) {
        error(404, 'Session not found');
    }

    await db.softDeleteSession(event.platform.env.D1_DB, sessionId);
});
