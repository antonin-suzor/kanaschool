<script lang="ts">
    import '../app.css';
    import { goto, invalidateAll } from '$app/navigation';

    let { children, data } = $props();

    let isLoggingOut = $state(false);

    async function handleLogout() {
        isLoggingOut = true;
        try {
            await fetch('/api/users/logout', { method: 'POST' });
            await invalidateAll();
            await goto('/');
        } finally {
            isLoggingOut = false;
        }
    }
</script>

<header class="border-b">
    <div class="container mx-auto flex items-center justify-between px-4 py-4">
        <div class="flex items-center gap-8">
            <a href="/" class="text-2xl font-bold text-primary"> KanaSchool </a>
            <nav class="hidden gap-6 md:flex">
                <a href="/" class="text-sm font-medium text-gray-700 hover:text-gray-900"> Home </a>
                <a href="/about" class="text-sm font-medium text-gray-700 hover:text-gray-900"> About </a>
                <a href="/contact" class="text-sm font-medium text-gray-700 hover:text-gray-900"> Contact </a>
                <a href="/kanas" class="text-sm font-medium text-gray-700 hover:text-gray-900"> Kanas </a>
                <a href="/training" class="text-sm font-medium text-gray-700 hover:text-gray-900"> Training </a>
                <a href="/users" class="text-sm font-medium text-gray-700 hover:text-gray-900"> Users </a>
                <a href="/sessions" class="text-sm font-medium text-gray-700 hover:text-gray-900"> Sessions </a>
                {#if data.user}
                    <a href="/sessions/my" class="text-sm font-medium text-gray-700 hover:text-gray-900">
                        My Sessions
                    </a>
                    <a href="/sessions/new" class="text-sm font-medium text-gray-700 hover:text-gray-900">
                        New Session
                    </a>
                {/if}
            </nav>
        </div>
        <div class="flex items-center gap-4">
            {#if data.user}
                <a href="/users/{data.user.name}" class="text-sm font-medium text-gray-700 hover:text-gray-900">
                    {data.user.name}
                </a>
                <a href="/account" class="text-sm font-medium text-gray-700 hover:text-gray-900"> Manage Account </a>
                <button
                    disabled={isLoggingOut}
                    onclick={handleLogout}
                    class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </button>
            {:else}
                <a
                    href="/auth/login"
                    class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Log In
                </a>
                <a
                    href="/auth/signup"
                    class="rounded-lg border border-gray-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Sign Up
                </a>
            {/if}
        </div>
    </div>
</header>

<main class="flex-1">
    {@render children()}
</main>

<footer class="mt-auto border-t bg-muted">
    <div class="container mx-auto px-4 py-8 text-center text-sm">
        <p class="mb-2">KanaSchool - Learn Japanese Hiragana and Katakana</p>
        <a href="https://antonin-suzor.com" target="_blank" class="text-primary hover:underline">
            Made by Antonin Suzor
        </a>
    </div>
</footer>
