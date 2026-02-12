# kanaschool

Learn Hiraganas and Katakanas the fun way.

## Tech stack

- SvelteKit (with Typescript)
- Tailwind
- Bun (will be replaced with cloudflare)
- Prettier

## Roadmap

- SHOULD HAVE (around march 2026):
  - deployment on cloudflare (needs to switch the adapter+database to cloudflare+D1)
  - better user profiles, including profile picture and banners (via cloudflare R2)
- MAY HAVE (not before april 2026):
  - admin dashboard (mostly for statistics on the website)
    - REQUIRES: user access levels (at least user+admin) to moderate content and usage
- WILL NOT HAVE:
  - any realtime features

## AI coding

The first commit of this repo is 100% vibe-coded inside the `src/` file.
A functional (page-by-page) design and database design was provided in `design.md`, the initial setup was made by hand, but the actual was 100% vibe-coded with github copilot, claude haiku 4.5.
To get better results, the AI was not asked to implement the whole project at once, but was given smaller tasks, manually broken down by the developer. Previous attempts failed because the AI was asked too much at once.
