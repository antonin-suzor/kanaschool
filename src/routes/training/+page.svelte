<script lang="ts">
    import kanas from '$lib/kanas.json';
    import { onMount } from 'svelte';

    interface Kana {
        id: number;
        reading: string;
        is_katakana: number;
        mod: number;
        consonant_line: string;
        vowel_column: string;
        unicode: string;
    }

    interface GuessedKana extends Kana {
        is_correct: number;
    }

    let hiragana: boolean = $state(true);
    let katakana: boolean = $state(true);
    let diacritics: boolean = $state(true);

    let guessedKanas: GuessedKana[] = $state([]);
    let currentKana: Kana | null = $state(null);
    let userInput: string = $state('');
    let feedback: { type: 'correct' | 'incorrect'; message: string } | null = $state(null);
    let isSubmitting: boolean = $state(false);
    let inputElement: HTMLInputElement | null = $state(null);

    const totalGuesses = $derived(guessedKanas.length);
    const correctGuesses = $derived(guessedKanas.filter((k) => k.is_correct === 1).length);
    const percentage = $derived(totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0);

    function getRandomKana(): Kana {
        let attempts = 0;
        while (attempts < 1000) {
            const randomKana = kanas[Math.floor(Math.random() * kanas.length)] as Kana;

            // Check if kana matches criteria
            const isHiragana = randomKana.is_katakana === 0 && hiragana;
            const isKatakana = randomKana.is_katakana === 1 && katakana;
            const hasDiacritics = randomKana.mod > 0;
            const matchesDiacritics = !hasDiacritics || (hasDiacritics && diacritics);

            if ((isHiragana || isKatakana) && matchesDiacritics) {
                return randomKana;
            }

            attempts++;
        }

        // Fallback (should rarely happen)
        return kanas[0] as Kana;
    }

    function initializeTraining() {
        guessedKanas = [];
        currentKana = getRandomKana();
        userInput = '';
        feedback = null;
    }

    function handlePreferenceChange() {
        currentKana = getRandomKana();
    }

    async function handleSubmit() {
        if (!currentKana || isSubmitting) return;

        isSubmitting = true;
        const isCorrect = userInput.toLowerCase() === currentKana.reading.toLowerCase();

        // Record the guess
        guessedKanas = [
            ...guessedKanas,
            {
                ...currentKana,
                is_correct: isCorrect ? 1 : 0,
            },
        ];

        // Show feedback
        if (isCorrect) {
            feedback = { type: 'correct', message: 'Correct!' };
        } else {
            feedback = {
                type: 'incorrect',
                message: `Incorrect (you said: ${userInput}, correct: ${currentKana.reading})`,
            };
        }

        // Get next kana
        setTimeout(() => {
            currentKana = getRandomKana();
            userInput = '';
            isSubmitting = false;
            // Refocus input
            setTimeout(() => {
                inputElement?.focus();
            }, 0);
        }, 800);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSubmit();
        }
    }

    function resetSession() {
        if (confirm('Reset your progress?')) {
            guessedKanas = [];
            currentKana = getRandomKana();
            userInput = '';
            feedback = null;
        }
    }

    onMount(() => {
        currentKana = getRandomKana();
        inputElement?.focus();
    });
</script>

<svelte:head>
    <title>Training - KanaSchool</title>
    <meta name="description" content="Start a free training session without saving your progress." />
    <meta property="og:title" content="Training - KanaSchool" />
    <meta property="og:description" content="Start a free training session without saving your progress." />
    <meta property="og:type" content="website" />
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-8">
    <div class="mx-auto max-w-4xl">
        <div class="mb-8">
            <h1 class="mb-6 text-4xl font-bold text-gray-900">Free Training</h1>

            <div class="mb-6 rounded-lg bg-white p-6 shadow-lg">
                <h2 class="mb-4 text-lg font-semibold text-gray-800">What would you like to practice?</h2>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <label
                        class="flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition hover:bg-gray-50"
                    >
                        <input
                            type="checkbox"
                            bind:checked={hiragana}
                            onchange={handlePreferenceChange}
                            class="h-4 w-4"
                        />
                        <span class="text-gray-700">Hiragana (ひらがな)</span>
                    </label>

                    <label
                        class="flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition hover:bg-gray-50"
                    >
                        <input
                            type="checkbox"
                            bind:checked={katakana}
                            onchange={handlePreferenceChange}
                            class="h-4 w-4"
                        />
                        <span class="text-gray-700">Katakana (カタカナ)</span>
                    </label>

                    <label
                        class="flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition hover:bg-gray-50"
                    >
                        <input
                            type="checkbox"
                            bind:checked={diacritics}
                            onchange={handlePreferenceChange}
                            class="h-4 w-4"
                        />
                        <span class="text-gray-700">Include diacritics (゛゜)</span>
                    </label>
                </div>

                <div class="mt-4 text-sm text-gray-600">
                    <p>Progress: {totalGuesses} guesses • {correctGuesses} correct • {percentage}%</p>
                </div>
            </div>
        </div>

        {#if currentKana}
            <div class="rounded-lg bg-white p-12 shadow-lg">
                {#if guessedKanas.length > 0}
                    <div class="mb-8 border-b pb-6">
                        <div class="flex flex-wrap gap-2">
                            {#each guessedKanas as kana, index (index)}
                                <div
                                    class="rounded px-3 py-1 text-3xl font-bold"
                                    class:bg-green-200={kana.is_correct === 1}
                                    class:bg-red-200={kana.is_correct === 0}
                                    class:text-green-900={kana.is_correct === 1}
                                    class:text-red-900={kana.is_correct === 0}
                                >
                                    {kana.unicode}
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <div class="mb-8 text-center">
                    <p class="text-lg text-gray-600">
                        {totalGuesses} / Total
                    </p>
                    <p class="text-3xl font-bold text-blue-600">
                        {percentage}%
                    </p>
                </div>

                <div class="mb-12 text-center">
                    <div class="mb-8 text-9xl font-bold text-gray-900 select-none">
                        {currentKana.unicode}
                    </div>
                </div>

                {#if feedback}
                    <div class="mb-8 text-center">
                        <p
                            class="text-2xl font-bold transition-all duration-300"
                            class:text-green-600={feedback.type === 'correct'}
                            class:text-red-600={feedback.type === 'incorrect'}
                        >
                            {feedback.message}
                        </p>
                    </div>
                {/if}

                <div class="text-center">
                    <input
                        type="text"
                        bind:this={inputElement}
                        bind:value={userInput}
                        onkeydown={handleKeydown}
                        placeholder="Type the reading..."
                        disabled={isSubmitting}
                        class="w-full max-w-md rounded-lg border-2 border-gray-300 px-6 py-3 text-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                    />
                    <p class="mt-4 text-sm text-gray-500">Press Enter or Space to submit</p>
                </div>

                <div class="mt-8 text-center">
                    <button
                        onclick={resetSession}
                        class="rounded-lg bg-gray-300 px-6 py-2 font-bold text-gray-800 transition hover:bg-gray-400"
                    >
                        Reset Progress
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>
