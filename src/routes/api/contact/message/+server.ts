import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return json({ error: 'Message is required' }, { status: 400 });
        }

        const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (!discordWebhookUrl) {
            console.error('DISCORD_WEBHOOK_URL environment variable is not set');
            return json({ error: 'Server configuration error' }, { status: 500 });
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
            return json({ error: 'Failed to send message' }, { status: 500 });
        }

        return json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Contact message error:', error);
        return json({ error: 'Failed to process request' }, { status: 500 });
    }
};
