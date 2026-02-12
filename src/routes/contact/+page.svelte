<script lang="ts">
    let { form } = $props();
    let message = $state('');
    let isSubmitting = $state(false);

    async function handleSubmit() {
        if (!message.trim()) return;

        isSubmitting = true;
        try {
            const response = await fetch('/api/contact/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message.trim() }),
            });

            if (response.ok) {
                message = '';
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Contact - KanaSchool</title>
    <meta name="description" content="Get in touch with the KanaSchool team. We'd love to hear from you." />
    <meta property="og:title" content="Contact - KanaSchool" />
    <meta property="og:description" content="Get in touch with the KanaSchool team. We'd love to hear from you." />
    <meta property="og:type" content="website" />
</svelte:head>

<main class="min-h-screen bg-white">
    <div class="container mx-auto px-4 py-16">
        <h1 class="mb-8 text-4xl font-bold text-gray-900">Contact</h1>

        <div class="mx-auto max-w-2xl space-y-8">
            <section>
                <h2 class="mb-4 text-2xl font-bold text-gray-900">Get in Touch</h2>
                <p class="mb-6 text-gray-700">We'd love to hear from you! You can reach out to us in several ways:</p>

                <div class="mb-8 space-y-4">
                    <div>
                        <h3 class="mb-2 font-semibold text-gray-900">Email</h3>
                        <a href="mailto:antonin@suzor.net" class="text-blue-600 hover:underline"> antonin@suzor.net </a>
                    </div>

                    <div>
                        <h3 class="mb-2 font-semibold text-gray-900">GitHub</h3>
                        <a
                            href="https://github.com/antonin-suzor/kanaschool"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-blue-600 hover:underline"
                        >
                            Open an issue on GitHub
                        </a>
                    </div>
                </div>
            </section>

            <section>
                <h2 class="mb-4 text-2xl font-bold text-gray-900">Send a Message</h2>
                <form onsubmit={handleSubmit} class="space-y-4">
                    <div>
                        <label for="message" class="block text-sm font-medium text-gray-700">Your Message</label>
                        <textarea
                            id="message"
                            bind:value={message}
                            rows="8"
                            class="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                            placeholder="Type your message here..."
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        class="rounded-lg border border-gray-300 bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>

                    {#if form?.success}
                        <p class="text-green-600">Message sent successfully!</p>
                    {/if}
                    {#if form?.error}
                        <p class="text-red-600">{form.error}</p>
                    {/if}
                </form>
            </section>
        </div>
    </div>
</main>
