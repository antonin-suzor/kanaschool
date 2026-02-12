<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';

    let name = $state('');
    let password = $state('');
    let passwordConfirm = $state('');
    let isLoading = $state(false);
    let error = $state('');

    async function handleSignup() {
        error = '';

        if (!name.trim()) {
            error = 'Username is required';
            return;
        }

        if (!password) {
            error = 'Password is required';
            return;
        }

        if (password !== passwordConfirm) {
            error = 'Passwords do not match';
            return;
        }

        isLoading = true;
        try {
            const response = await fetch('/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name.trim(), password }),
            });

            const data = await response.json();

            if (!response.ok) {
                error = data.error || 'Signup failed';
                return;
            }

            await invalidateAll();
            await goto('/');
        } catch (err) {
            error = 'An error occurred during signup';
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Sign Up - KanaSchool</title>
    <meta name="description" content="Create a new KanaSchool account." />
    <meta property="og:title" content="Sign Up - KanaSchool" />
    <meta property="og:description" content="Create a new KanaSchool account." />
    <meta property="og:type" content="website" />
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-white px-4">
    <div class="w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-8">
        <h1 class="mb-6 text-3xl font-bold text-gray-900">Sign Up</h1>

        <form onsubmit={handleSignup} class="space-y-4">
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
                <p class="mt-1 text-xs text-gray-500">Alphanumeric, hyphens, underscores only</p>
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

            <div>
                <label for="passwordConfirm" class="block text-sm font-medium text-gray-700"> Confirm Password </label>
                <input
                    id="passwordConfirm"
                    type="password"
                    bind:value={passwordConfirm}
                    placeholder="Confirm password"
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
                {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
        </form>

        <p class="mt-4 text-center text-sm text-gray-600">
            Already have an account?
            <a href="/auth/login" class="font-semibold text-blue-600 hover:underline">Log In</a>
        </p>
    </div>
</main>
