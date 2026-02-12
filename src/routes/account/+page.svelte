<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    let currentTab = $state<'password' | 'username' | 'privacy' | 'delete'>('password');
    let isLoading = $state(false);
    let message = $state('');
    let messageType = $state<'success' | 'error'>('success');
    let showDeleteConfirm = $state(false);
    let deletePassword = $state('');

    // Password form state
    let oldPassword = $state('');
    let newPassword = $state('');
    let confirmPassword = $state('');

    // Username form state
    let newUsername = $state('');
    let initialUsername: string;

    // Privacy form state
    let isPublic = $state(false);
    let initialIsPublic: boolean;

    // Initialize form values from data
    $effect(() => {
        if (!newUsername) {
            newUsername = data.user.name;
            initialUsername = data.user.name;
        }
        if (initialIsPublic === undefined) {
            isPublic = data.user.is_public;
            initialIsPublic = data.user.is_public;
        }
    });

    function showMessage(text: string, type: 'success' | 'error') {
        message = text;
        messageType = type;
        setTimeout(() => {
            message = '';
        }, 5000);
    }

    async function handlePasswordChange() {
        message = '';

        if (!oldPassword) {
            showMessage('Current password is required', 'error');
            return;
        }

        if (!newPassword) {
            showMessage('New password is required', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('New passwords do not match', 'error');
            return;
        }

        if (newPassword === oldPassword) {
            showMessage('New password must be different from current password', 'error');
            return;
        }

        isLoading = true;
        try {
            const response = await fetch('/api/users/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updatePassword',
                    oldPassword,
                    newPassword,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                showMessage(responseData.error || 'Failed to update password', 'error');
                return;
            }

            oldPassword = '';
            newPassword = '';
            confirmPassword = '';
            showMessage('Password updated successfully', 'success');
        } catch (err) {
            showMessage('An error occurred while updating password', 'error');
        } finally {
            isLoading = false;
        }
    }

    async function handleUsernameChange() {
        message = '';

        const trimmedUsername = newUsername.trim();

        if (!trimmedUsername) {
            showMessage('Username is required', 'error');
            return;
        }

        if (trimmedUsername === data.user.name) {
            showMessage('New username must be different', 'error');
            return;
        }

        isLoading = true;
        try {
            const response = await fetch('/api/users/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateUsername',
                    newUsername: trimmedUsername,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                showMessage(responseData.error || 'Failed to update username', 'error');
                return;
            }

            showMessage('Username updated successfully', 'success');
            await invalidateAll();
            await goto(`/users/${trimmedUsername}`);
        } catch (err) {
            showMessage('An error occurred while updating username', 'error');
        } finally {
            isLoading = false;
        }
    }

    async function handleVisibilityChange() {
        message = '';

        isLoading = true;
        try {
            const response = await fetch('/api/users/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateVisibility',
                    isPublic,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                showMessage(responseData.error || 'Failed to update privacy setting', 'error');
                return;
            }

            showMessage(isPublic ? 'Profile is now public' : 'Profile is now private', 'success');
            await invalidateAll();
        } catch (err) {
            showMessage('An error occurred while updating privacy setting', 'error');
        } finally {
            isLoading = false;
        }
    }

    async function handleDeleteAccount() {
        message = '';

        if (!deletePassword) {
            showMessage('Password is required to delete your account', 'error');
            return;
        }

        isLoading = true;
        try {
            const response = await fetch('/api/users/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'deleteAccount',
                    password: deletePassword,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                showMessage(responseData.error || 'Failed to delete account', 'error');
                deletePassword = '';
                showDeleteConfirm = false;
                return;
            }

            await invalidateAll();
            await goto('/');
        } catch (err) {
            showMessage('An error occurred while deleting account', 'error');
            deletePassword = '';
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Account Settings - KanaSchool</title>
    <meta name="description" content="Manage your KanaSchool account settings." />
    <meta property="og:title" content="Account Settings - KanaSchool" />
    <meta property="og:description" content="Manage your KanaSchool account settings." />
    <meta property="og:type" content="website" />
</svelte:head>

<main class="min-h-screen bg-white">
    <div class="container mx-auto max-w-2xl px-4 py-12">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p class="mt-2 text-sm text-gray-600">Manage your account preferences and security</p>
        </div>

        {#if message}
            <div
                class="mb-6 rounded-lg border px-4 py-3 text-sm"
                class:border-green-200={messageType === 'success'}
                class:bg-green-50={messageType === 'success'}
                class:text-green-800={messageType === 'success'}
                class:border-red-200={messageType === 'error'}
                class:bg-red-50={messageType === 'error'}
                class:text-red-800={messageType === 'error'}
            >
                {message}
            </div>
        {/if}

        <div class="border-b border-gray-200">
            <div class="flex gap-8">
                <button
                    onclick={() => (currentTab = 'password')}
                    class="border-b-2 px-1 py-4 text-sm font-medium transition-colors"
                    class:border-blue-600={currentTab === 'password'}
                    class:border-transparent={currentTab !== 'password'}
                    class:text-gray-900={currentTab === 'password'}
                    class:text-gray-600={currentTab !== 'password'}
                >
                    Change Password
                </button>
                <button
                    onclick={() => (currentTab = 'username')}
                    class="border-b-2 px-1 py-4 text-sm font-medium transition-colors"
                    class:border-blue-600={currentTab === 'username'}
                    class:border-transparent={currentTab !== 'username'}
                    class:text-gray-900={currentTab === 'username'}
                    class:text-gray-600={currentTab !== 'username'}
                >
                    Change Username
                </button>
                <button
                    onclick={() => (currentTab = 'privacy')}
                    class="border-b-2 px-1 py-4 text-sm font-medium transition-colors"
                    class:border-blue-600={currentTab === 'privacy'}
                    class:border-transparent={currentTab !== 'privacy'}
                    class:text-gray-900={currentTab === 'privacy'}
                    class:text-gray-600={currentTab !== 'privacy'}
                >
                    Privacy Settings
                </button>
                <button
                    onclick={() => (currentTab = 'delete')}
                    class="border-b-2 px-1 py-4 text-sm font-medium transition-colors"
                    class:border-blue-600={currentTab === 'delete'}
                    class:border-transparent={currentTab !== 'delete'}
                    class:text-gray-900={currentTab === 'delete'}
                    class:text-gray-600={currentTab !== 'delete'}
                >
                    Delete Account
                </button>
            </div>
        </div>

        <div class="mt-8">
            {#if currentTab === 'password'}
                <div class="max-w-md">
                    <h2 class="mb-4 text-lg font-semibold text-gray-900">Change Password</h2>
                    <form onsubmit={handlePasswordChange} class="space-y-4">
                        <div>
                            <label for="oldPassword" class="block text-sm font-medium text-gray-700">
                                Current Password
                            </label>
                            <input
                                id="oldPassword"
                                type="password"
                                bind:value={oldPassword}
                                placeholder="Enter your current password"
                                class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label for="newPassword" class="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                bind:value={newPassword}
                                placeholder="Enter your new password"
                                class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                bind:value={confirmPassword}
                                placeholder="Confirm your new password"
                                class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            class="w-full rounded-lg border border-gray-300 bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            {/if}

            {#if currentTab === 'username'}
                <div class="max-w-md">
                    <h2 class="mb-4 text-lg font-semibold text-gray-900">Change Username</h2>
                    <form onsubmit={handleUsernameChange} class="space-y-4">
                        <div>
                            <label for="currentUsername" class="block text-sm font-medium text-gray-700">
                                Current Username
                            </label>
                            <input
                                id="currentUsername"
                                type="text"
                                value={data.user.name}
                                disabled
                                class="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-600"
                            />
                        </div>

                        <div>
                            <label for="newUsername" class="block text-sm font-medium text-gray-700">
                                New Username
                            </label>
                            <input
                                id="newUsername"
                                type="text"
                                bind:value={newUsername}
                                placeholder="Enter your new username"
                                class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                disabled={isLoading}
                            />
                            <p class="mt-1 text-xs text-gray-500">
                                Usernames can only contain letters, numbers, hyphens, and underscores
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            class="w-full rounded-lg border border-gray-300 bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Update Username'}
                        </button>
                    </form>
                </div>
            {/if}

            {#if currentTab === 'privacy'}
                <div class="max-w-md">
                    <h2 class="mb-4 text-lg font-semibold text-gray-900">Privacy Settings</h2>
                    <form onsubmit={handleVisibilityChange} class="space-y-4">
                        <div class="space-y-3">
                            <label class="flex items-center">
                                <input
                                    type="radio"
                                    bind:group={isPublic}
                                    value={true}
                                    disabled={isLoading}
                                    class="h-4 w-4 border-gray-300"
                                />
                                <span class="ml-3 text-sm">
                                    <span class="font-medium text-gray-900">Public Profile</span>
                                    <p class="text-gray-600">
                                        Your profile and training sessions are visible to other users
                                    </p>
                                </span>
                            </label>

                            <label class="flex items-center">
                                <input
                                    type="radio"
                                    bind:group={isPublic}
                                    value={false}
                                    disabled={isLoading}
                                    class="h-4 w-4 border-gray-300"
                                />
                                <span class="ml-3 text-sm">
                                    <span class="font-medium text-gray-900">Private Profile</span>
                                    <p class="text-gray-600">Only you can see your profile and training sessions</p>
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            class="w-full rounded-lg border border-gray-300 bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Save Privacy Settings'}
                        </button>
                    </form>
                </div>
            {/if}

            {#if currentTab === 'delete'}
                <div class="max-w-md">
                    <h2 class="mb-4 text-lg font-semibold text-gray-900">Delete Account</h2>

                    {#if !showDeleteConfirm}
                        <div class="rounded-lg border border-red-200 bg-red-50 p-4">
                            <p class="mb-4 text-sm text-red-800">
                                Deleting your account is permanent and cannot be undone. All your data will be deleted.
                            </p>
                            <button
                                type="button"
                                onclick={() => (showDeleteConfirm = true)}
                                disabled={isLoading}
                                class="w-full rounded-lg border border-red-300 bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                Delete My Account
                            </button>
                        </div>
                    {:else}
                        <form onsubmit={handleDeleteAccount} class="space-y-4">
                            <div class="rounded-lg border border-red-300 bg-red-50 p-4">
                                <p class="mb-4 text-sm font-semibold text-red-900">
                                    Are you sure? This cannot be undone.
                                </p>
                                <div>
                                    <label for="deletePassword" class="block text-sm font-medium text-gray-700">
                                        Enter your password to confirm
                                    </label>
                                    <input
                                        id="deletePassword"
                                        type="password"
                                        bind:value={deletePassword}
                                        placeholder="Enter your password"
                                        class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div class="flex gap-2">
                                <button
                                    type="button"
                                    onclick={() => {
                                        showDeleteConfirm = false;
                                        deletePassword = '';
                                    }}
                                    disabled={isLoading}
                                    class="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    class="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isLoading ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </form>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</main>
``` Now let me run the type check:
