<script lang="ts">
    import type { Kana } from '$lib/types';

    interface PageData {
        kana: Kana;
        alternativeKana?: Kana;
    }

    let { data }: { data: PageData } = $props();

    function getConsonantLineName(line: string): string {
        const names: Record<string, string> = {
            '-': 'Vowel',
            k: 'K',
            s: 'S',
            t: 'T',
            n: 'N',
            h: 'H',
            m: 'M',
            y: 'Y',
            r: 'R',
            w: 'W',
        };
        return names[line] || line;
    }

    function getVowelColumnName(col: string): string {
        const names: Record<string, string> = {
            a: 'A',
            i: 'I',
            u: 'U',
            e: 'E',
            o: 'O',
            '-': 'N',
        };
        return names[col] || col;
    }

    function getModName(mod: number): string {
        const names: Record<number, string> = {
            0: 'None',
            1: 'Dakuten (H->B)',
            2: 'Handakuten (H->P)',
        };
        return names[mod] || 'Unknown';
    }
</script>

<svelte:head>
    <title>{data.kana.reading} - Katakana - KanaSchool</title>
    <meta name="description" content="Learn about the katakana character {data.kana.unicode} ({data.kana.reading})." />
    <meta property="og:title" content="{data.kana.reading} - Katakana - KanaSchool" />
    <meta
        property="og:description"
        content="Learn about the katakana character {data.kana.unicode} ({data.kana.reading})."
    />
    <meta property="og:type" content="website" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <div class="mb-8">
        <a href="/katakanas" class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
            Back to Katakana
        </a>
    </div>

    <div class="grid gap-8 lg:grid-cols-3">
        <!-- Main Character Display -->
        <div class="lg:col-span-1">
            <div class="rounded-lg border border-gray-200 bg-white p-8">
                <div class="text-center">
                    <div class="mb-4 text-9xl font-bold">{data.kana.unicode}</div>
                    <div class="text-2xl font-semibold text-gray-700">{data.kana.reading}</div>
                </div>
            </div>
        </div>

        <!-- Information -->
        <div class="lg:col-span-2">
            <div class="space-y-6">
                <!-- Basic Info -->
                <div class="rounded-lg border border-gray-200 bg-white p-6">
                    <h2 class="mb-4 text-xl font-bold">Information</h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-semibold text-gray-700">Reading</h3>
                            <p class="text-gray-600">{data.kana.reading}</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-700">Consonant Line</h3>
                            <p class="text-gray-600">{getConsonantLineName(data.kana.consonant_line)}</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-700">Vowel Column</h3>
                            <p class="text-gray-600">{getVowelColumnName(data.kana.vowel_column)}</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-700">Diacritic</h3>
                            <p class="text-gray-600">{getModName(data.kana.mod)}</p>
                        </div>
                    </div>
                </div>

                <!-- Alternative Reading -->
                {#if data.alternativeKana}
                    <div class="rounded-lg border border-gray-200 bg-blue-50 p-6">
                        <h2 class="mb-4 text-xl font-bold">Alternative Character</h2>
                        <p class="mb-4 text-gray-700">Both of the following characters can be read as "ji":</p>
                        <div class="flex gap-6">
                            <div class="text-center">
                                <div class="mb-2 text-6xl font-bold">{data.kana.unicode}</div>
                                <p class="text-sm text-gray-600">Shi (シ)</p>
                            </div>
                            <div class="text-center">
                                <div class="mb-2 text-6xl font-bold">{data.alternativeKana.unicode}</div>
                                <p class="text-sm text-gray-600">Chi (チ)</p>
                            </div>
                        </div>
                    </div>
                {/if}

                <!-- Wikipedia Link -->
                <div class="rounded-lg border border-gray-200 bg-white p-6">
                    <a
                        href="https://en.wikipedia.org/wiki/Katakana"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        Learn more on Wikipedia
                        <svg
                            class="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            ></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
