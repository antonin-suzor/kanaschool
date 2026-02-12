<script lang="ts">
    import type { Kana } from '$lib/types';

    interface PageData {
        kanas: Kana[];
    }

    let { data }: { data: PageData } = $props();

    // Group kanas by consonant line for better organization
    const groupedKanas = $derived.by(() => {
        const groups: Record<string, Kana[]> = {};
        for (const kana of data.kanas) {
            if (!groups[kana.consonant_line]) {
                groups[kana.consonant_line] = [];
            }
            groups[kana.consonant_line].push(kana);
        }
        return groups;
    });

    const consonantOrder = ['-', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
</script>

<svelte:head>
    <title>Hiragana - KanaSchool</title>
    <meta name="description" content="Explore and learn all hiragana characters." />
    <meta property="og:title" content="Hiragana - KanaSchool" />
    <meta property="og:description" content="Explore and learn all hiragana characters." />
    <meta property="og:type" content="website" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <div class="mb-8 flex items-center justify-between">
        <h1 class="text-4xl font-bold">Hiragana</h1>
        <a
            href="https://en.wikipedia.org/wiki/Hiragana"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
            Wikipedia
        </a>
    </div>

    <div class="space-y-8">
        {#each consonantOrder as line}
            {#if groupedKanas[line]}
                <div>
                    <h2 class="mb-4 text-lg font-semibold text-gray-700">
                        {#if line === '-'}
                            Vowels
                        {:else if line === 'k'}
                            K Line
                        {:else if line === 's'}
                            S Line
                        {:else if line === 't'}
                            T Line
                        {:else if line === 'n'}
                            N Line
                        {:else if line === 'h'}
                            H Line
                        {:else if line === 'm'}
                            M Line
                        {:else if line === 'y'}
                            Y Line
                        {:else if line === 'r'}
                            R Line
                        {:else if line === 'w'}
                            W Line
                        {/if}
                    </h2>
                    <div class="grid grid-cols-5 gap-4 sm:grid-cols-10">
                        {#each groupedKanas[line] as kana (kana.id)}
                            <a
                                href="/hiraganas/{kana.reading}"
                                class="flex h-20 items-center justify-center rounded-lg border border-gray-200 bg-white text-3xl font-bold transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-md"
                            >
                                {kana.unicode}
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        {/each}
    </div>
</div>
