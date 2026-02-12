<script lang="ts">
</script>

<svelte:head>
    <title>About - KanaSchool</title>
    <meta
        name="description"
        content="Learn about KanaSchool, its purpose, and the technology stack used to build it."
    />
    <meta property="og:title" content="About - KanaSchool" />
    <meta
        property="og:description"
        content="Learn about KanaSchool, its purpose, and the technology stack used to build it."
    />
    <meta property="og:type" content="website" />
</svelte:head>

<main class="min-h-screen bg-white">
    <div class="container mx-auto px-4 py-16">
        <h1 class="mb-8 text-4xl font-bold text-gray-900">About KanaSchool</h1>

        <div class="prose prose-lg max-w-none space-y-8 text-gray-700">
            <section>
                <h2 class="mb-4 text-2xl font-bold text-gray-900">Purpose</h2>
                <p>
                    KanaSchool is a free web application designed to help learners master Japanese hiragana and katakana
                    characters. Whether you're just starting your journey into Japanese or refining your skills,
                    KanaSchool provides an interactive and engaging way to practice and internalize these essential
                    writing systems.
                </p>
            </section>

            <section>
                <h2 class="mb-4 text-2xl font-bold text-gray-900">Tech Stack</h2>
                <p class="mb-4">
                    KanaSchool is built with modern, open-source technologies to ensure a fast, responsive, and reliable
                    learning experience:
                </p>
                <ul class="list-inside list-disc space-y-2">
                    <li>
                        <strong>SvelteKit 2</strong> - A modern full-stack framework built on Svelte 5 for building fast web
                        applications
                    </li>
                    <li><strong>Bun</strong> - A fast JavaScript runtime and package manager</li>
                    <li><strong>TailwindCSS 4</strong> - A utility-first CSS framework for efficient styling</li>
                    <li><strong>shadcn-svelte</strong> - A component library providing accessible UI components</li>
                    <li><strong>SQLite</strong> - A lightweight, self-contained SQL database</li>
                </ul>
            </section>

            <section>
                <h2 class="mb-4 text-2xl font-bold text-gray-900">Creator</h2>
                <p>
                    KanaSchool is a side project created by
                    <a
                        href="https://antonin-suzor.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-semibold text-blue-600 hover:underline"
                    >
                        Antonin Suzor
                    </a>
                    . Built with a passion for language learning and web development.
                </p>
            </section>
        </div>
    </div>
</main>
