import { command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { error } from '@sveltejs/kit';

const SendMessageSchema = v.object({
    message: v.pipe(v.string(), v.nonEmpty()),
});

export const sendContactMessage = command(SendMessageSchema, async ({ message }) => {
    const event = getRequestEvent();

    const discordWebhookUrl = event.platform?.env?.DISCORD_WEBHOOK_URL;
    if (!discordWebhookUrl) {
        console.error('DISCORD_WEBHOOK_URL environment variable is not set');
        error(500, 'Server configuration error');
    }

    const response = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: `New message from KanaSchool contact form:\n\n${message}`,
        }),
    });

    if (!response.ok) {
        console.error('Discord webhook error:', response.statusText);
        error(500, 'Failed to send message');
    }
});
