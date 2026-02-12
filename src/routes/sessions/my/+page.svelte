<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    interface SessionInfo {
        id: number;
        hiragana: number;
        katakana: number;
        mods: number;
        mult: number;
        is_public: number;
        created_at: string;
        updated_at: string;
        finished_at: string | null;
        percentage: number;
        lastInteraction: string;
        isFinished: boolean;
    }

    // Initialize from data but keep as reactive state for visibility toggle
    let unfinishedSessions = $state<SessionInfo[]>([]);
    let finishedSessions = $state<SessionInfo[]>([]);
    let deleteConfirmId = $state<number | null>(null);
    let isDeleting = $state(false);

    $effect(() => {
        unfinishedSessions = data.unfinishedSessions;
        finishedSessions = data.finishedSessions;
    });

    function getKanaSetLabel(session: SessionInfo): string {
        const parts = [];
        if (session.hiragana) parts.push('Hiragana');
        if (session.katakana) parts.push('Katakana');
        if (session.mods) parts.push('+ Diacritics');
        parts.push(`(×${session.mult})`);
        return parts.join(' ');
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    async function toggleVisibility(e: Event, sessionId: number, currentPublic: number) {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await fetch(`/api/sessions/${sessionId}/visibility`, {
                method: 'POST',
                body: JSON.stringify({
                    sessionId,
                    isPublic: currentPublic === 0,
                }),
            });

            if (response.ok) {
                // Update local state
                const allSessions = [...unfinishedSessions, ...finishedSessions];
                const session = allSessions.find((s) => s.id === sessionId);
                if (session) {
                    session.is_public = currentPublic === 0 ? 1 : 0;
                }
                unfinishedSessions = unfinishedSessions;
                finishedSessions = finishedSessions;
            }
        } catch (error) {
            console.error('Error toggling visibility:', error);
        }
    }

    async function deleteSession(e: Event, sessionId: number) {
        e.preventDefault();
        e.stopPropagation();

        isDeleting = true;
        try {
            const response = await fetch('/api/users/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'deleteSession',
                    sessionId,
                }),
            });

            if (response.ok) {
                // Remove from local state
                unfinishedSessions = unfinishedSessions.filter((s) => s.id !== sessionId);
                finishedSessions = finishedSessions.filter((s) => s.id !== sessionId);
                deleteConfirmId = null;
            }
        } catch (error) {
            console.error('Error deleting session:', error);
        } finally {
            isDeleting = false;
        }
    }

    function sessionRow(session: SessionInfo) {
        return {
            percentage: `${session.percentage}%`,
            kanaSet: getKanaSetLabel(session),
            startTime: formatDate(session.created_at),
            lastInteraction: formatDate(session.lastInteraction),
            status: session.isFinished ? 'Finished' : 'In Progress',
            isPublic: session.is_public === 1,
        };
    }
</script>

<svelte:head>
    <title>My Sessions - KanaSchool</title>
    <meta name="description" content="View your training sessions." />
    <meta property="og:title" content="My Sessions - KanaSchool" />
    <meta property="og:description" content="View your training sessions." />
    <meta property="og:type" content="website" />
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-8">
    <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex items-center justify-between">
            <h1 class="text-4xl font-bold text-gray-900">My Sessions</h1>
            <a
                href="/sessions/new"
                class="rounded-lg bg-blue-600 px-6 py-2 font-bold text-white transition hover:bg-blue-700"
            >
                Start New Session
            </a>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {#if unfinishedSessions.length > 0}
                <div>
                    <h2 class="mb-4 text-2xl font-bold text-gray-800">In Progress</h2>
                    <div class="space-y-4">
                        {#each unfinishedSessions as session (session.id)}
                            <div
                                class="relative rounded-lg border-l-4 border-yellow-500 bg-white p-4 shadow-md transition hover:shadow-lg"
                            >
                                {#if deleteConfirmId === session.id}
                                    <div
                                        class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50"
                                    >
                                        <div class="rounded-lg bg-white p-6 text-center shadow-lg">
                                            <p class="mb-4 font-semibold text-gray-900">Delete this session?</p>
                                            <div class="flex gap-2">
                                                <button
                                                    onclick={() => (deleteConfirmId = null)}
                                                    disabled={isDeleting}
                                                    class="flex-1 rounded px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onclick={(e) => deleteSession(e, session.id)}
                                                    disabled={isDeleting}
                                                    class="flex-1 rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                {/if}
                                <a href="/sessions/{session.id}" class="block">
                                    <div class="mb-3 flex items-start justify-between">
                                        <div class="text-2xl font-bold text-yellow-600">{session.percentage}%</div>
                                        <div class="flex gap-2">
                                            <button
                                                onclick={(e) => toggleVisibility(e, session.id, session.is_public)}
                                                class="rounded px-3 py-1 text-sm font-semibold transition"
                                                class:bg-blue-100={session.is_public === 0}
                                                class:text-blue-700={session.is_public === 0}
                                                class:bg-purple-100={session.is_public === 1}
                                                class:text-purple-700={session.is_public === 1}
                                            >
                                                {session.is_public === 1 ? 'Public' : 'Private'}
                                            </button>
                                            <button
                                                onclick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    deleteConfirmId = session.id;
                                                }}
                                                class="rounded bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 transition hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div class="space-y-2 text-sm text-gray-700">
                                        <div>
                                            <span class="font-semibold">Kanas:</span>
                                            {getKanaSetLabel(session)}
                                        </div>
                                        <div>
                                            <span class="font-semibold">Started:</span>
                                            {formatDate(session.created_at)}
                                        </div>
                                        <div>
                                            <span class="font-semibold">Last activity:</span>
                                            {formatDate(session.lastInteraction)}
                                        </div>
                                        <div>
                                            <span
                                                class="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800"
                                            >
                                                In Progress
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            {#if finishedSessions.length > 0}
                <div>
                    <h2 class="mb-4 text-2xl font-bold text-gray-800">Finished</h2>
                    <div class="space-y-4">
                        {#each finishedSessions as session (session.id)}
                            <div
                                class="relative rounded-lg border-l-4 border-green-500 bg-white p-4 shadow-md transition hover:shadow-lg"
                            >
                                {#if deleteConfirmId === session.id}
                                    <div
                                        class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50"
                                    >
                                        <div class="rounded-lg bg-white p-6 text-center shadow-lg">
                                            <p class="mb-4 font-semibold text-gray-900">Delete this session?</p>
                                            <div class="flex gap-2">
                                                <button
                                                    onclick={() => (deleteConfirmId = null)}
                                                    disabled={isDeleting}
                                                    class="flex-1 rounded px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onclick={(e) => deleteSession(e, session.id)}
                                                    disabled={isDeleting}
                                                    class="flex-1 rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                {/if}
                                <a href="/sessions/{session.id}" class="block">
                                    <div class="mb-3 flex items-start justify-between">
                                        <div class="text-2xl font-bold text-green-600">{session.percentage}%</div>
                                        <div class="flex gap-2">
                                            <button
                                                onclick={(e) => toggleVisibility(e, session.id, session.is_public)}
                                                class="rounded px-3 py-1 text-sm font-semibold transition"
                                                class:bg-blue-100={session.is_public === 0}
                                                class:text-blue-700={session.is_public === 0}
                                                class:bg-purple-100={session.is_public === 1}
                                                class:text-purple-700={session.is_public === 1}
                                            >
                                                {session.is_public === 1 ? 'Public' : 'Private'}
                                            </button>
                                            <button
                                                onclick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    deleteConfirmId = session.id;
                                                }}
                                                class="rounded bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 transition hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div class="space-y-2 text-sm text-gray-700">
                                        <div>
                                            <span class="font-semibold">Kanas:</span>
                                            {getKanaSetLabel(session)}
                                        </div>
                                        <div>
                                            <span class="font-semibold">Started:</span>
                                            {formatDate(session.created_at)}
                                        </div>
                                        <div>
                                            <span class="font-semibold">Last activity:</span>
                                            {formatDate(session.lastInteraction)}
                                        </div>
                                        <div>
                                            <span
                                                class="inline-block rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
                                            >
                                                Finished
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        {#if unfinishedSessions.length === 0 && finishedSessions.length === 0}
            <div class="py-12 text-center">
                <p class="mb-6 text-lg text-gray-600">You haven't started any sessions yet.</p>
                <a
                    href="/sessions/new"
                    class="rounded-lg bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700"
                >
                    Start Your First Session
                </a>
            </div>
        {/if}
    </div>
</div>
