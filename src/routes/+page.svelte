<script lang="ts">
    let { data } = $props();
</script>

<svelte:head>
    <title>KanaSchool - Learn Japanese Hiragana and Katakana</title>
    <meta
        name="description"
        content="KanaSchool is a free web application for learning Japanese hiragana and katakana characters."
    />
    <meta property="og:title" content="KanaSchool - Learn Japanese Hiragana and Katakana" />
    <meta
        property="og:description"
        content="KanaSchool is a free web application for learning Japanese hiragana and katakana characters."
    />
    <meta property="og:type" content="website" />
</svelte:head>

<main class="min-h-screen bg-white">
    <!-- Hero Section -->
    <section class="border-b border-gray-200 px-4 py-16 text-center">
        <h1 class="mb-4 text-5xl font-bold text-gray-900">KanaSchool</h1>
        <p class="mb-8 text-xl text-gray-600">Master Japanese Hiragana and Katakana</p>
        <div class="flex justify-center gap-4">
            <a
                href="/auth/signup"
                class="rounded-lg border border-gray-300 bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
            >
                Sign Up
            </a>
            <a
                href="/auth/login"
                class="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
                Log In
            </a>
        </div>
    </section>

    <!-- All-Time Stats Section -->
    <section class="border-b border-gray-200 px-4 py-16">
        <h2 class="mb-8 text-center text-3xl font-bold text-gray-900">All-Time Statistics</h2>
        <div class="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p class="mb-2 text-sm font-semibold text-gray-600">Total Users</p>
                <p class="text-4xl font-bold text-gray-900">{data.stats.allTime.userCount}</p>
            </div>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p class="mb-2 text-sm font-semibold text-gray-600">Total Sessions</p>
                <p class="text-4xl font-bold text-gray-900">{data.stats.allTime.sessionCount}</p>
            </div>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p class="mb-2 text-sm font-semibold text-gray-600">Correct Answers</p>
                <p class="text-4xl font-bold text-gray-900">{data.stats.allTime.correctPercentage}%</p>
            </div>
        </div>
    </section>

    <!-- Last Month Stats Section -->
    <section class="border-b border-gray-200 px-4 py-16">
        <h2 class="mb-8 text-center text-3xl font-bold text-gray-900">Last 30 Days</h2>
        <div class="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p class="mb-2 text-sm font-semibold text-gray-600">New Accounts</p>
                <p class="text-4xl font-bold text-gray-900">{data.stats.lastMonth.accountsCreated}</p>
            </div>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p class="mb-2 text-sm font-semibold text-gray-600">Sessions Started</p>
                <p class="text-4xl font-bold text-gray-900">{data.stats.lastMonth.sessionCount}</p>
            </div>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p class="mb-2 text-sm font-semibold text-gray-600">Correct Answers</p>
                <p class="text-4xl font-bold text-gray-900">{data.stats.lastMonth.correctPercentage}%</p>
            </div>
        </div>
    </section>
</main>
