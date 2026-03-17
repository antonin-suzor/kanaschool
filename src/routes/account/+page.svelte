<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import type { PageData } from './$types';
    import {
        changePassword,
        changeUsername,
        changeVisibility,
        deleteUserAccount,
        updateUserProfile,
    } from './account.remote';

    let { data }: { data: PageData } = $props();

    let currentTab = $state<'profile' | 'password' | 'username' | 'privacy' | 'delete'>('profile');
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

    // Profile form state
    let description = $state('');
    let initialDescription: string;
    let avatarFile = $state<File | null>(null);
    let bannerFile = $state<File | null>(null);
    let avatarPreview = $state<string | null>(null);
    let bannerPreview = $state<string | null>(null);
    let isUploadingAvatar = $state(false);
    let isUploadingBanner = $state(false);
    let isDeletingAvatar = $state(false);
    let isDeletingBanner = $state(false);

    const MAX_DESCRIPTION_LENGTH = 500;

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
        if (initialDescription === undefined) {
            description = data.profile.description ?? '';
            initialDescription = description;
        }
    });

    function showMessage(text: string, type: 'success' | 'error') {
        message = text;
        messageType = type;
        setTimeout(() => {
            message = '';
        }, 5000);
    }

    function getImageUrl(key: string | null): string | null {
        if (!key) return null;
        // Images are served via the /api/image proxy route
        return `/api/image/${encodeURIComponent(key)}`;
    }

    function handleAvatarFileChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        avatarFile = file;
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }
        avatarPreview = file ? URL.createObjectURL(file) : null;
    }

    function handleBannerFileChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        bannerFile = file;
        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview);
        }
        bannerPreview = file ? URL.createObjectURL(file) : null;
    }

    async function handleProfileSave() {
        message = '';

        if (description.length > MAX_DESCRIPTION_LENGTH) {
            showMessage(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`, 'error');
            return;
        }

        isLoading = true;
        try {
            await updateUserProfile({ description: description.trim() === '' ? null : description.trim() });
            initialDescription = description.trim();
            showMessage('Profile updated successfully', 'success');
            await invalidateAll();
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'An error occurred while updating profile', 'error');
        } finally {
            isLoading = false;
        }
    }

    async function handleAvatarUpload() {
        if (!avatarFile) return;

        isUploadingAvatar = true;
        message = '';
        try {
            const formData = new FormData();
            formData.append('kind', 'avatar');
            formData.append('file', avatarFile);

            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || 'Upload failed');
            }

            avatarFile = null;
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
                avatarPreview = null;
            }
            showMessage('Avatar updated successfully', 'success');
            await invalidateAll();
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'An error occurred while uploading avatar', 'error');
        } finally {
            isUploadingAvatar = false;
        }
    }

    async function handleBannerUpload() {
        if (!bannerFile) return;

        isUploadingBanner = true;
        message = '';
        try {
            const formData = new FormData();
            formData.append('kind', 'banner');
            formData.append('file', bannerFile);

            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || 'Upload failed');
            }

            bannerFile = null;
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
                bannerPreview = null;
            }
            showMessage('Banner updated successfully', 'success');
            await invalidateAll();
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'An error occurred while uploading banner', 'error');
        } finally {
            isUploadingBanner = false;
        }
    }

    async function handleAvatarDelete() {
        isDeletingAvatar = true;
        message = '';
        try {
            const response = await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ kind: 'avatar' }),
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || 'Delete failed');
            }
            showMessage('Avatar removed', 'success');
            await invalidateAll();
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'An error occurred while removing avatar', 'error');
        } finally {
            isDeletingAvatar = false;
        }
    }

    async function handleBannerDelete() {
        isDeletingBanner = true;
        message = '';
        try {
            const response = await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ kind: 'banner' }),
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || 'Delete failed');
            }
            showMessage('Banner removed', 'success');
            await invalidateAll();
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'An error occurred while removing banner', 'error');
        } finally {
            isDeletingBanner = false;
        }
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
            await changePassword({ oldPassword, newPassword });
            oldPassword = '';
            newPassword = '';
            confirmPassword = '';
            showMessage('Password updated successfully', 'success');
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'An error occurred while updating password', 'error');
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
            await changeUsername({ newUsername: trimmedUsername });
            showMessage('Username updated successfully', 'success');
            await invalidateAll();
            await goto(`/users/${trimmedUsername}`);
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'An error occurred while updating username', 'error');
        } finally {
            isLoading = false;
        }
    }

    async function handleVisibilityChange() {
        message = '';

        isLoading = true;
        try {
            await changeVisibility({ isPublic });
            showMessage(isPublic ? 'Profile is now public' : 'Profile is now private', 'success');
            await invalidateAll();
        } catch (err) {
            showMessage(
                err instanceof Error ? err.message : 'An error occurred while updating privacy setting',
                'error'
            );
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
            await deleteUserAccount({ _password: deletePassword });
            await invalidateAll();
            await goto('/');
        } catch (err) {
            showMessage(err instanceof Error ? err.message : 'An error occurred while deleting account', 'error');
            deletePassword = '';
            showDeleteConfirm = false;
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
            <div class="flex flex-wrap gap-x-6">
                <button
                    onclick={() => (currentTab = 'profile')}
                    class="border-b-2 px-1 py-4 text-sm font-medium transition-colors"
                    class:border-blue-600={currentTab === 'profile'}
                    class:border-transparent={currentTab !== 'profile'}
                    class:text-gray-900={currentTab === 'profile'}
                    class:text-gray-600={currentTab !== 'profile'}
                >
                    Profile
                </button>
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
            {#if currentTab === 'profile'}
                <div class="space-y-10">
                    <h2 class="text-lg font-semibold text-gray-900">Profile Details</h2>

                    <!-- Description -->
                    <div class="max-w-md">
                        <h3 class="mb-3 text-sm font-semibold text-gray-700">Description</h3>
                        <div class="space-y-3">
                            <div>
                                <label for="description" class="block text-sm font-medium text-gray-700"> Bio </label>
                                <textarea
                                    id="description"
                                    bind:value={description}
                                    rows={4}
                                    maxlength={MAX_DESCRIPTION_LENGTH}
                                    placeholder="Tell others about yourself..."
                                    class="mt-1 w-full resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
                                    disabled={isLoading}
                                ></textarea>
                                <p class="mt-1 text-right text-xs text-gray-400">
                                    {description.length} / {MAX_DESCRIPTION_LENGTH}
                                </p>
                            </div>
                            <button
                                type="button"
                                onclick={handleProfileSave}
                                disabled={isLoading}
                                class="rounded-lg border border-gray-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Save Description'}
                            </button>
                        </div>
                    </div>

                    <!-- Avatar -->
                    <div>
                        <h3 class="mb-3 text-sm font-semibold text-gray-700">Profile Picture</h3>
                        <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <!-- Current / preview -->
                            <div class="shrink-0">
                                {#if avatarPreview}
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar preview"
                                        class="h-24 w-24 rounded-full border border-gray-200 object-cover"
                                    />
                                {:else if data.profile.avatar_key}
                                    <img
                                        src={getImageUrl(data.profile.avatar_key)}
                                        alt="Current avatar"
                                        class="h-24 w-24 rounded-full border border-gray-200 object-cover"
                                    />
                                {:else}
                                    <div
                                        class="flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-2xl font-bold text-gray-400"
                                    >
                                        {data.user.name[0].toUpperCase()}
                                    </div>
                                {/if}
                            </div>

                            <div class="flex flex-1 flex-col gap-2">
                                <label
                                    for="avatarFile"
                                    class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Choose image
                                </label>
                                <input
                                    id="avatarFile"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onchange={handleAvatarFileChange}
                                    class="sr-only"
                                />
                                {#if avatarFile}
                                    <p class="text-xs text-gray-500">{avatarFile.name}</p>
                                    <button
                                        type="button"
                                        onclick={handleAvatarUpload}
                                        disabled={isUploadingAvatar}
                                        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                                    </button>
                                {/if}
                                {#if data.profile.avatar_key && !avatarFile}
                                    <button
                                        type="button"
                                        onclick={handleAvatarDelete}
                                        disabled={isDeletingAvatar}
                                        class="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {isDeletingAvatar ? 'Removing...' : 'Remove Avatar'}
                                    </button>
                                {/if}
                                <p class="text-xs text-gray-400">JPEG, PNG, WebP or GIF. Max 5 MB.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Banner -->
                    <div>
                        <h3 class="mb-3 text-sm font-semibold text-gray-700">Banner Image</h3>
                        <div class="flex flex-col gap-4">
                            <!-- Current / preview -->
                            {#if bannerPreview}
                                <img
                                    src={bannerPreview}
                                    alt="Banner preview"
                                    class="h-32 w-full rounded-lg border border-gray-200 object-cover"
                                />
                            {:else if data.profile.banner_key}
                                <img
                                    src={getImageUrl(data.profile.banner_key)}
                                    alt="Current banner"
                                    class="h-32 w-full rounded-lg border border-gray-200 object-cover"
                                />
                            {:else}
                                <div
                                    class="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400"
                                >
                                    No banner set
                                </div>
                            {/if}

                            <div class="flex flex-wrap gap-2">
                                <label
                                    for="bannerFile"
                                    class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Choose image
                                </label>
                                <input
                                    id="bannerFile"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onchange={handleBannerFileChange}
                                    class="sr-only"
                                />
                                {#if bannerFile}
                                    <span class="self-center text-xs text-gray-500">{bannerFile.name}</span>
                                    <button
                                        type="button"
                                        onclick={handleBannerUpload}
                                        disabled={isUploadingBanner}
                                        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isUploadingBanner ? 'Uploading...' : 'Upload Banner'}
                                    </button>
                                {/if}
                                {#if data.profile.banner_key && !bannerFile}
                                    <button
                                        type="button"
                                        onclick={handleBannerDelete}
                                        disabled={isDeletingBanner}
                                        class="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {isDeletingBanner ? 'Removing...' : 'Remove Banner'}
                                    </button>
                                {/if}
                            </div>
                            <p class="text-xs text-gray-400">JPEG, PNG, WebP or GIF. Max 5 MB.</p>
                        </div>
                    </div>
                </div>
            {/if}

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
