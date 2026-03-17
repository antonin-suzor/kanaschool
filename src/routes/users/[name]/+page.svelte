<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    function getImageUrl(key: string | null): string | null {
        if (!key) return null;
        return `/api/image/${encodeURIComponent(key)}`;
    }

    interface Session {
        id: number;
        hiragana: number;
        katakana: number;
        mods: number;
        mult: number;
        is_public: number;
        created_at: string;
        finished_at: string | null;
        percentage: number;
        isFinished: boolean;
    }

    function getKanaSetLabel(session: Session): string {
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
</script>

<svelte:head>
    <title>{data.user.name} - KanaSchool</title>
    <meta name="description" content="View {data.user.name}'s KanaSchool profile and statistics." />
    <meta property="og:title" content="{data.user.name} - KanaSchool" />
    <meta property="og:description" content="View {data.user.name}'s KanaSchool profile and statistics." />
    <meta property="og:type" content="website" />
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-8">
    <div class="mx-auto max-w-7xl">
        <!-- User Header -->
        <div class="mb-12 overflow-hidden rounded-lg bg-white shadow-lg">
            <!-- Banner -->
            {#if data.user.banner_key}
                <img
                    src={getImageUrl(data.user.banner_key)}
                    alt="{data.user.name}'s banner"
                    class="h-40 w-full object-cover sm:h-52"
                />
            {:else}
                <div class="h-24 w-full bg-linear-to-r from-blue-200 to-indigo-300 sm:h-32"></div>
            {/if}

            <div class="p-6 sm:p-8">
                <!-- Avatar + name row -->
                <div class="-mt-12 mb-4 flex items-end gap-4 sm:-mt-14">
                    {#if data.user.avatar_key}
                        <img
                            src={getImageUrl(data.user.avatar_key)}
                            alt="{data.user.name}'s avatar"
                            class="h-20 w-20 shrink-0 rounded-full border-4 border-white object-cover shadow sm:h-24 sm:w-24"
                        />
                    {:else}
                        <div
                            class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-500 shadow sm:h-24 sm:w-24"
                        >
                            {data.user.name[0].toUpperCase()}
                        </div>
                    {/if}
                    <h1 class="mb-1 text-2xl font-bold text-gray-900 sm:text-4xl">{data.user.name}</h1>
                </div>

                {#if data.user.description}
                    <p class="mb-4 max-w-prose text-sm whitespace-pre-wrap text-gray-700">{data.user.description}</p>
                {/if}

                <div class="grid gap-4 text-sm text-gray-600 md:grid-cols-2">
                    <div>
                        <p class="font-semibold text-gray-700">Account created:</p>
                        <p>{formatDate(data.user.created_at)}</p>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-700">Last updated:</p>
                        <p>{formatDate(data.user.updated_at)}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics Grid -->
        <div class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Statistics</h2>
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-lg border border-gray-200 bg-white p-6 shadow">
                    <p class="text-sm font-semibold text-gray-600">Total Sessions</p>
                    <p class="text-3xl font-bold text-blue-600">{data.stats.totalSessions}</p>
                </div>

                <div class="rounded-lg border border-gray-200 bg-white p-6 shadow">
                    <p class="text-sm font-semibold text-gray-600">Finished Sessions</p>
                    <p class="text-3xl font-bold text-green-600">{data.stats.finishedSessions}</p>
                </div>

                <div class="rounded-lg border border-gray-200 bg-white p-6 shadow">
                    <p class="text-sm font-semibold text-gray-600">Correctness (All-time)</p>
                    <p class="text-3xl font-bold text-indigo-600">{data.stats.allTimePercentage}%</p>
                </div>

                <div class="rounded-lg border border-gray-200 bg-white p-6 shadow">
                    <p class="text-sm font-semibold text-gray-600">Correctness (Last 30 Days)</p>
                    <p class="text-3xl font-bold text-purple-600">{data.stats.lastMonthPercentage}%</p>
                </div>
            </div>
        </div>

        <!-- Sessions List -->
        <div>
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Session History</h2>
            {#if data.sessions.length > 0}
                <div class="space-y-4">
                    {#each data.sessions as session (session.id)}
                        <a
                            href="/sessions/{session.id}"
                            class="block rounded-lg border-l-4 bg-white p-6 shadow-md transition hover:shadow-lg"
                            class:border-green-500={session.isFinished}
                            class:border-yellow-500={!session.isFinished}
                        >
                            <div class="mb-3 flex items-start justify-between">
                                <div>
                                    <div
                                        class="text-3xl font-bold"
                                        class:text-green-600={session.isFinished}
                                        class:text-yellow-600={!session.isFinished}
                                    >
                                        {session.percentage}%
                                    </div>
                                </div>
                                <div class="text-right text-sm text-gray-600">
                                    <p class="font-semibold">{formatDate(session.created_at)}</p>
                                    {#if session.isFinished}
                                        <p class="text-xs text-gray-500">
                                            Completed {formatDate(session.finished_at!)}
                                        </p>
                                    {/if}
                                </div>
                            </div>
                            <div class="space-y-2 text-sm text-gray-700">
                                <div>
                                    <span class="font-semibold">Kanas:</span>
                                    {getKanaSetLabel(session)}
                                </div>
                                {#if session.isFinished}
                                    <div>
                                        <span
                                            class="inline-block rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
                                        >
                                            Finished
                                        </span>
                                    </div>
                                {:else}
                                    <div>
                                        <span
                                            class="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800"
                                        >
                                            In Progress
                                        </span>
                                    </div>
                                {/if}
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <div class="rounded-lg bg-white p-8 text-center shadow">
                    <p class="text-gray-600">No sessions yet</p>
                </div>
            {/if}
        </div>
    </div>
</div>
