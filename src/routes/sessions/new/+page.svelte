<script lang="ts">
    import { goto } from '$app/navigation';

    let hiragana = $state(true);
    let katakana = $state(true);
    let diacritics = $state(true);
    let multiplier: string | number = $state('1');
    let error: string | null = $state(null);

    function handleHiraganaChange() {
        // If turning off hiragana and katakana is also off, switch them
        if (!hiragana && !katakana) {
            katakana = true;
            hiragana = false;
            error = null;
        } else {
            error = null;
        }
    }

    function handleKatakanaChange() {
        // If turning off katakana and hiragana is also off, switch them
        if (!katakana && !hiragana) {
            hiragana = true;
            katakana = false;
            error = null;
        } else {
            error = null;
        }
    }

    async function handleStart(e: Event) {
        e.preventDefault();
        // Final validation
        if (!hiragana && !katakana) {
            error = 'Please select at least one of Hiragana or Katakana';
            return;
        }

        error = null;

        const response = await fetch('/api/sessions/create', {
            method: 'POST',
            body: JSON.stringify({
                hiragana: hiragana ? 1 : 0,
                katakana: katakana ? 1 : 0,
                mods: diacritics ? 1 : 0,
                mult: Number(multiplier),
            }),
        });

        if (response.ok) {
            const { sessionId } = await response.json();
            await goto(`/sessions/${sessionId}`);
        }
    }
</script>

<svelte:head>
    <title>Create New Session - KanaSchool</title>
    <meta name="description" content="Create a new training session with custom settings." />
    <meta property="og:title" content="Create New Session - KanaSchool" />
    <meta property="og:description" content="Create a new training session with custom settings." />
    <meta property="og:type" content="website" />
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-12">
    <div class="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        <h1 class="mb-8 text-4xl font-bold text-gray-900">Create New Session</h1>

        <form onsubmit={handleStart} class="space-y-6">
            <div class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">What would you like to practice?</h2>

                <label class="flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition hover:bg-gray-50">
                    <input type="checkbox" bind:checked={hiragana} onchange={handleHiraganaChange} class="h-4 w-4" />
                    <span class="text-lg text-gray-700">Hiragana (ひらがな)</span>
                </label>

                <label class="flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition hover:bg-gray-50">
                    <input type="checkbox" bind:checked={katakana} onchange={handleKatakanaChange} class="h-4 w-4" />
                    <span class="text-lg text-gray-700">Katakana (カタカナ)</span>
                </label>

                <label class="flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition hover:bg-gray-50">
                    <input type="checkbox" bind:checked={diacritics} class="h-4 w-4" />
                    <span class="text-lg text-gray-700">Include diacritics (゛゜)</span>
                </label>

                <p class="text-sm text-gray-600">You must select at least one of Hiragana or Katakana.</p>
            </div>

            {#if error}
                <div class="rounded-lg bg-red-50 p-4">
                    <p class="text-red-700">{error}</p>
                </div>
            {/if}

            <div>
                <label for="multiplier" class="mb-3 block text-lg font-semibold text-gray-800">
                    Times each kana appears:
                </label>
                <select
                    bind:value={multiplier}
                    id="multiplier"
                    class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-lg focus:border-blue-500 focus:outline-none"
                >
                    <option value="1">1x</option>
                    <option value="2">2x</option>
                    <option value="3">3x</option>
                    <option value="4">4x</option>
                    <option value="5">5x</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={!hiragana && !katakana}
                class="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
                Start Training
            </button>
        </form>
    </div>
</div>
