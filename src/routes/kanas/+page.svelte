<script lang="ts">
    import type { Kana } from '$lib/types';

    interface PageData {
        hiraganas: Kana[];
        katakanas: Kana[];
    }

    let { data }: { data: PageData } = $props();

    // Group kanas by consonant line for better organization
    function groupKanas(kanas: Kana[]): Record<string, Kana[]> {
        const groups: Record<string, Kana[]> = {};
        for (const kana of kanas) {
            if (!groups[kana.consonant_line]) {
                groups[kana.consonant_line] = [];
            }
            groups[kana.consonant_line].push(kana);
        }
        return groups;
    }

    const groupedHiraganas = $derived(groupKanas(data.hiraganas));
    const groupedKatakanas = $derived(groupKanas(data.katakanas));
    const consonantOrder = ['-', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];

    function getLineName(line: string): string {
        const names: Record<string, string> = {
            '-': 'Vowels',
            k: 'K Line',
            s: 'S Line',
            t: 'T Line',
            n: 'N Line',
            h: 'H Line',
            m: 'M Line',
            y: 'Y Line',
            r: 'R Line',
            w: 'W Line',
        };
        return names[line] || line;
    }
</script>

<svelte:head>
    <title>Kana Characters - KanaSchool</title>
    <meta name="description" content="Explore hiragana and katakana characters." />
    <meta property="og:title" content="Kana Characters - KanaSchool" />
    <meta property="og:description" content="Explore hiragana and katakana characters." />
    <meta property="og:type" content="website" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-4xl font-bold">Kana Characters</h1>

    <!-- Hiragana Section -->
    <div class="mb-12">
        <div class="mb-8 flex items-center justify-between">
            <h2 class="text-3xl font-bold">Hiragana</h2>
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
                {#if groupedHiraganas[line]}
                    <div>
                        <h3 class="mb-4 text-lg font-semibold text-gray-700">
                            {getLineName(line)}
                        </h3>
                        <div class="grid grid-cols-5 gap-4 sm:grid-cols-10">
                            {#each groupedHiraganas[line] as kana (kana.id)}
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

    <!-- Katakana Section -->
    <div>
        <div class="mb-8 flex items-center justify-between">
            <h2 class="text-3xl font-bold">Katakana</h2>
            <a
                href="https://en.wikipedia.org/wiki/Katakana"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
                Wikipedia
            </a>
        </div>

        <div class="space-y-8">
            {#each consonantOrder as line}
                {#if groupedKatakanas[line]}
                    <div>
                        <h3 class="mb-4 text-lg font-semibold text-gray-700">
                            {getLineName(line)}
                        </h3>
                        <div class="grid grid-cols-5 gap-4 sm:grid-cols-10">
                            {#each groupedKatakanas[line] as kana (kana.id)}
                                <a
                                    href="/katakanas/{kana.reading}"
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
</div>
