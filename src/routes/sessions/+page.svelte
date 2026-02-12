<script lang="ts">
    let { data } = $props();
</script>

<svelte:head>
    <title>Sessions - KanaSchool</title>
    <meta name="description" content="View session statistics and browse training sessions." />
    <meta property="og:title" content="Sessions - KanaSchool" />
    <meta property="og:description" content="View session statistics and browse training sessions." />
    <meta property="og:type" content="website" />
</svelte:head>

<main class="min-h-screen bg-white">
    <div class="container mx-auto px-4 py-16">
        <div class="mb-12 flex items-center justify-between">
            <h1 class="text-4xl font-bold text-gray-900">Session Statistics</h1>
            {#if data.user}
                <div class="flex gap-2">
                    <a
                        href="/sessions/my"
                        class="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                        My Sessions
                    </a>
                    <a
                        href="/sessions/new"
                        class="rounded-lg border border-gray-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Start New Session
                    </a>
                </div>
            {:else}
                <div class="flex gap-2">
                    <a
                        href="/auth/login"
                        class="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                        Log In
                    </a>
                    <a
                        href="/auth/signup"
                        class="rounded-lg border border-gray-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Sign Up to Start
                    </a>
                </div>
            {/if}
        </div>

        <!-- Sessions Count Section -->
        <div class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Sessions</h2>
            <div class="grid gap-8 md:grid-cols-2">
                <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                    <p class="mb-2 text-sm font-semibold text-gray-600">All-Time Sessions</p>
                    <p class="text-5xl font-bold text-gray-900">{data.stats.sessions.total}</p>
                </div>

                <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                    <p class="mb-2 text-sm font-semibold text-gray-600">Sessions Started (Last 30 Days)</p>
                    <p class="text-5xl font-bold text-gray-900">{data.stats.sessions.lastMonth}</p>
                </div>
            </div>
        </div>

        <!-- Correct Answers Section -->
        <div class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Correct Answers</h2>
            <div class="grid gap-8 md:grid-cols-2">
                <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                    <p class="mb-2 text-sm font-semibold text-gray-600">All-Time Percentage</p>
                    <p class="text-5xl font-bold text-gray-900">{data.stats.correctAnswers.allTime}%</p>
                </div>

                <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                    <p class="mb-2 text-sm font-semibold text-gray-600">Last 30 Days Percentage</p>
                    <p class="text-5xl font-bold text-gray-900">{data.stats.correctAnswers.lastMonth}%</p>
                </div>
            </div>
        </div>

        <!-- Kana Ratio Section -->
        <div class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Hiragana vs Katakana</h2>
            <div class="grid gap-8 md:grid-cols-2">
                <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                    <p class="mb-2 text-sm font-semibold text-gray-600">Hiragana</p>
                    <p class="text-5xl font-bold text-gray-900">{data.stats.kanaRatio.hiragana}%</p>
                </div>

                <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                    <p class="mb-2 text-sm font-semibold text-gray-600">Katakana</p>
                    <p class="text-5xl font-bold text-gray-900">{data.stats.kanaRatio.katakana}%</p>
                </div>
            </div>
        </div>

        <!-- Diacritics Ratio Section -->
        <div>
            <h2 class="mb-6 text-2xl font-bold text-gray-900">Diacritics</h2>
            <div class="grid gap-8 md:grid-cols-2">
                <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                    <p class="mb-2 text-sm font-semibold text-gray-600">With Diacritics</p>
                    <p class="text-5xl font-bold text-gray-900">{data.stats.diacriticsRatio.diacritics}%</p>
                </div>

                <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                    <p class="mb-2 text-sm font-semibold text-gray-600">Without Diacritics</p>
                    <p class="text-5xl font-bold text-gray-900">{data.stats.diacriticsRatio.noDiacritics}%</p>
                </div>
            </div>
        </div>
    </div>
</main>
