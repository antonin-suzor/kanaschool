<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';

    let name = $state('');
    let password = $state('');
    let isLoading = $state(false);
    let error = $state('');

    async function handleLogin() {
        error = '';

        if (!name.trim() || !password) {
            error = 'Username and password are required';
            return;
        }

        isLoading = true;
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name.trim(), password }),
            });

            const data = await response.json();

            if (!response.ok) {
                error = data.error || 'Login failed';
                return;
            }

            await invalidateAll();
            await goto('/');
        } catch (err) {
            error = 'An error occurred during login';
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Log In - KanaSchool</title>
    <meta name="description" content="Log in to your KanaSchool account." />
    <meta property="og:title" content="Log In - KanaSchool" />
    <meta property="og:description" content="Log in to your KanaSchool account." />
    <meta property="og:type" content="website" />
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-white px-4">
    <div class="w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-8">
        <h1 class="mb-6 text-3xl font-bold text-gray-900">Log In</h1>

        <form onsubmit={handleLogin} class="space-y-4">
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Username</label>
                <input
                    id="name"
                    type="text"
                    bind:value={name}
                    placeholder="Enter username"
                    class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    placeholder="Enter password"
                    class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    disabled={isLoading}
                />
            </div>

            {#if error}
                <p class="text-sm text-red-600">{error}</p>
            {/if}

            <button
                disabled={isLoading}
                type="submit"
                class="w-full rounded-lg border border-gray-300 bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? 'Logging in...' : 'Log In'}
            </button>
        </form>

        <p class="mt-4 text-center text-sm text-gray-600">
            Don't have an account?
            <a href="/auth/signup" class="font-semibold text-blue-600 hover:underline">Sign Up</a>
        </p>
    </div>
</main>
