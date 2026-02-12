<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    import { onMount } from 'svelte';

    let { data }: { data: PageData } = $props();

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

    let remainingKanas: Kana[] = $derived(data.remainingKanas);
    let guessedKanas: GuessedKana[] = $derived(data.guessedKanas);
    let currentKana: Kana | null = $derived(remainingKanas.length > 0 ? remainingKanas[0] : null);
    let userInput: string = $state('');
    let feedback: { type: 'correct' | 'incorrect'; message: string } | null = $state(null);
    let isSubmitting: boolean = $state(false);
    let sessionFinished: boolean = $derived(remainingKanas.length === 0);
    let inputElement: HTMLInputElement | null = $state(null);
    let continueLink: HTMLAnchorElement | null = $state(null);
    let localSessionFinished: boolean = $state(false);
    let deleteConfirmId: number | null = $state(null);
    let isDeleting: boolean = $state(false);

    $effect(() => {
        if ((data.isFinished || localSessionFinished) && data.isOwner) {
            continueLink?.focus();
        }
    });

    const totalGuesses = $derived(guessedKanas.length);
    const correctGuesses = $derived(guessedKanas.filter((k) => k.is_correct === 1).length);
    const percentage = $derived(totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0);

    async function handleSubmit() {
        if (!currentKana || isSubmitting) return;

        isSubmitting = true;
        const isCorrect = userInput.toLowerCase() === currentKana.reading.toLowerCase();

        try {
            const response = await fetch(`/api/sessions/${page.params.id}/guess`, {
                method: 'POST',
                body: JSON.stringify({
                    kanaId: currentKana.id,
                    isCorrect,
                }),
            });

            if (response.ok) {
                // Update guessed list
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

                // Remove from remaining
                remainingKanas = remainingKanas.slice(1);

                // Move to next kana
                if (remainingKanas.length > 0) {
                    currentKana = remainingKanas[0];
                    userInput = '';
                    isSubmitting = false;
                    // Refocus input after next kana is displayed
                    setTimeout(() => {
                        inputElement?.focus();
                    }, 200);
                } else {
                    localSessionFinished = true;
                    isSubmitting = false;
                    // Finish the session
                    finishSession();
                    // Focus the continue link when session finishes
                    setTimeout(() => {
                        continueLink?.focus();
                    }, 200);
                }
            }
        } catch (error) {
            console.error('Error submitting guess:', error);
            isSubmitting = false;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSubmit();
        }
    }

    async function finishSession() {
        const response = await fetch(`/api/sessions/${page.params.id}/finish`, {
            method: 'POST',
        });

        if (!response.ok) {
            console.error('Error finishing session');
        }
    }

    async function deleteSessionHandler() {
        isDeleting = true;
        const sessionId = parseInt(page.params.id || '0', 10);
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
                // Redirect to sessions page after deletion
                await goto('/sessions/my');
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            isDeleting = false;
        }
    }

    onMount(() => {
        if (!data.isFinished) {
            inputElement?.focus();
        }
    });
</script>

<svelte:head>
    <title>Training Session - KanaSchool</title>
    <meta name="description" content="View or continue a training session." />
    <meta property="og:title" content="Training Session - KanaSchool" />
    <meta property="og:description" content="View or continue a training session." />
    <meta property="og:type" content="website" />
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-8">
    {#if data.isFinished || localSessionFinished}
        <div class="mx-auto max-w-2xl">
            <div class="rounded-lg bg-white p-12 shadow-lg">
                <h1 class="mb-6 text-center text-4xl font-bold text-gray-900">Session Complete!</h1>

                {#if guessedKanas.length > 0}
                    <div class="mb-8 rounded-lg bg-gray-50 p-4">
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
                    <div class="mb-4 text-6xl font-bold text-blue-600">{percentage}%</div>
                    <p class="text-2xl text-gray-600">{correctGuesses} out of {totalGuesses} correct</p>
                </div>

                {#if data.isOwner}
                    <div class="text-center">
                        {#if deleteConfirmId === parseInt(page.params.id || '0', 10)}
                            <div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                                <p class="mb-4 font-semibold text-red-900">Delete this session permanently?</p>
                                <div class="flex justify-center gap-2">
                                    <button
                                        onclick={() => (deleteConfirmId = null)}
                                        disabled={isDeleting}
                                        class="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onclick={deleteSessionHandler}
                                        disabled={isDeleting}
                                        class="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Session'}
                                    </button>
                                </div>
                            </div>
                        {/if}
                        <div class="flex justify-center gap-4">
                            <a
                                bind:this={continueLink}
                                href="/sessions/my"
                                class="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                tabindex="0"
                            >
                                View All Sessions
                            </a>
                            <button
                                onclick={() => (deleteConfirmId = parseInt(page.params.id || '0', 10))}
                                class="mt-8 rounded-lg bg-red-600 px-6 py-3 font-bold text-white transition duration-200 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Delete Session
                            </button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {:else if currentKana}
        <div class="mx-auto max-w-2xl">
            {#if guessedKanas.length > 0}
                <div class="mb-8 rounded-lg bg-white p-4 shadow">
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

            <div class="rounded-lg bg-white p-12 shadow-lg">
                <div class="mb-8 text-center">
                    <p class="text-lg text-gray-600">
                        {totalGuesses} / {totalGuesses + remainingKanas.length} correct
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
                        disabled={isSubmitting || sessionFinished}
                        class="w-full max-w-md rounded-lg border-2 border-gray-300 px-6 py-3 text-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                    />
                    <p class="mt-4 text-sm text-gray-500">Press Enter or Space to submit</p>
                </div>
            </div>
        </div>
    {/if}
</div>
