<script lang="ts">
    let { data } = $props();
</script>

<svelte:head>
    <title>Users - KanaSchool</title>
    <meta name="description" content="View user statistics and global user information." />
    <meta property="og:title" content="Users - KanaSchool" />
    <meta property="og:description" content="View user statistics and global user information." />
    <meta property="og:type" content="website" />
</svelte:head>

<main class="min-h-screen bg-white">
    <div class="container mx-auto px-4 py-16">
        <h1 class="mb-12 text-4xl font-bold text-gray-900">User Statistics</h1>

        <div class="grid gap-8 md:grid-cols-2">
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                <p class="mb-2 text-sm font-semibold text-gray-600">Total Users</p>
                <p class="text-5xl font-bold text-gray-900">{data.stats.totalUsers}</p>
            </div>

            <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                <p class="mb-2 text-sm font-semibold text-gray-600">New Users (Last 30 Days)</p>
                <p class="text-5xl font-bold text-gray-900">{data.stats.usersLastMonth}</p>
            </div>

            <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                <p class="mb-2 text-sm font-semibold text-gray-600">Average Sessions per User</p>
                <p class="text-5xl font-bold text-gray-900">{data.stats.averageSessionsPerUser}</p>
            </div>

            <div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
                <p class="mb-2 text-sm font-semibold text-gray-600">Maximum Sessions by Any User</p>
                <p class="text-5xl font-bold text-gray-900">{data.stats.maxSessionsForUser}</p>
            </div>
        </div>
    </div>
</main>
