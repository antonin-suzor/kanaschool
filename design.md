# Database design

The database is a sqlite database.
Nothing should ever be hard-deleted, we either use soft-delete where possible or don't delete at all.

## Table designs

`users`

- id: number primary key
- name: string not null
- password_hash: string not null
- is_public: bool
- created_at: date not null
- updated_at: date not null
- deleted_at: date

`sessions`

- user_id: number foreign key references `users`
- is_public: bool
- hiragana: bool
- katakana: bool
- mods: bool
- mult: number not null (how many times should each kana be shown, value must be >= 1)
- created_at: date not null
- updated_at: date not null
- deleted_at: date
- finished_at: date

`kanas` (note that the "wi" and "we" hiraganas/katakanas should not be included in the app at all)

- id: number primary key
- reading: string not null (1 to 3 chars long)
- is_katakana: bool
- mod: number (0 for no mod, 1 for the h->b mod, 2 for h->p mod)
- consonnant_line: string not null (1-char long string, for `ni` reading -> `n`, for `chi` reading -> `t`, for `bi` reading -> `h`, for `i` reading -> `-`, for `n` reading -> `w`)
- vowel_column: string not null (1-char long string, for `ha` reading -> `a`, for `a` reading -> `a`, for `n` reading -> `-`)
- unicode: string (contains the unicode representation of the kana)

`session_kanas`

- session_id: number not null foreign key references `sessions`
- kana_id: number not null foreign key references `kanas`
- mult_position: number not null (the how-many-th time this kana was shown, value must be >= 1)
- submitted_at: date not null
- is_correct: bool

# Pages design

Note that a header should be present on all pages. That header should include links to Homepage, signup/login/logout depending on whether a user is logged in, Training page, and New session page if a user is logged in.

## Homepage

Location: `/`

Contains:

- Hero block with app name + catchphrase + anything relevant for a first impression on the user
- All-time stats: user count, session count, percentage of correct answers
- Recent stats (last month): accounts created, session count, percentage of correct answers
- Signup/login links
- Footer with links to the different public parts of the app + copyright and that sort of stuff

## About page

Location: `/about`

Explain what the website is about.
Explain both the purpose and the tech stack.
Also state that it was a side-project by Antonin Suzor.

## Contact page

Location: `/contact`

Tell people that they can contact me in several ways:

- Email at `antonin@suzor.net`
- GitHub issue at `antonin-suzor/kanaschool`
- Give them a text field to compose their own message, that the backend will proxy to me via discord.

## Hiragana/Katakana grid page

Location: `/hiraganas` and `/katakanas`

Displays a grid of hiragana and katakana, depending on the page. Includes a link to wikipedia.
Each kana should be a link to its own page.

## Hiragana/Katakana page

Location: `/hiraganas/[reading]` and `/katakanas/[reading]`

Displays the kana (for the "ji" reading, should display both options and say that they can both be read as "ji").
Also displays information about the consonnant line, the diatric, and includes a link to wikipedia.

## Kanas grid page

Location: `/kanas`

Displays both grids: hiragana and katakana.
Includes links to wikipedia as needed.
Each kana should be a link to its own page.

## Global users page

Location: `/users`

Contains statistics about the users:

- total number of users
- users signed up in the last month
- average number of sessions per user
- max number of sessions for any user

## User page

Location: `/users/[name]`

Content depends on the whether the user is public or not.

If the user is not public or does not exist, then the page will simply say so.

Otherwise:

- their name and account creation/modification date should be displayed
- some statistics should be included: total number of sessions and average correctness (all-time and last month)
- their history of sessions (in a vertical, most-recent-to-top list) should be displayed (use 10-by-10 paging)

## Global sessions page

Location: `/sessions`

Contains statistics about the sessions:

- number of sessions (all-time and started in the last month)
- percentage of good answers (all-time and in the last month)
- hiragana/katakana ratio of kanas
- diatrics/no-diatrics ration of kanas

Also contains a button/link to start a new session.

## User sessions page

Location: `/sessions/my`

Here, a user can view their sessions. Their unfinished sessions (if any) should be displayed in the left column (if needed), their finished sessions in the right column.
The columns themselves should look the exact same as the list in the User page, with the same 10-by-10, most-recent-to-top paging (the finished_at column should be replaced by a "continue" option for the unfinished sessions).

Also contains a button/link to start a new session.

## New session page

Location: `/sessions/new`

Here, a user can create a new session, specifying the session's options:

- should it contain hiraganas ?
- should it contain katakanas ?
- should it contain diatrics ?
- how many times should each kana be asked for ?

Then, they can launch the session (it needs to be created in the backend first).

## Session page

Location: `/sessions/[id]`

Content depends on the session's properties:

If it's not done yet, only the user that created it can access it.

- In that case, the frontend must be aware of both the session settings (which are immutable once the session is started) and the already-made guesses (in case the user comes back to an unfinished session).
- A random kana among the remaining guesses is displayed in the middle of the screen, with a text input below it (with auto-focus).
- When the user presses enter, space, or tab, we verify whether or not they had a correct input (by checking if their trimmed, lowercased input is equal to the kana's reading).
- We then send the result to the backend to save it, and display the result in the list of results.

If it's over and public, the results are available for all to see.

If it's over but private, if it does not exist, or if it's not done yet but the current user is not its owner, there should be a message stating that either of these three could be the case.

## Training page

Location: `/training`

Works just like a real session, but there is no end to it nor is anything saved/sent to the backend, it's all client-side.

## Every page related to account management

Things like signing up, loggin in/out, changing the account's name or password...
I leave that all up to you.

# Codebase design

This codebase is setup with:

- SvelteKit and Svelte 5: there are runes, use runes, it's very important for code quality
- Bun runtime: use it for sqlite, password hashing, and any common task that it can handle
- TailwindCSS, shadcn-svelte, lucide-svelte: use those extensively for the frontend

Regarding file architecture:

- Put all custom type/interface definitions in `/lib/types.ts`

# Other

Don't use emojis in the code, the comments, or the user interface.
Keep in mind that there are exceptions in hiraganas/katakanas: "chi" (diatric "ji"), "tsu", and "shi" (diatric "ji" as well, for now, be naive about it).

You will be given an env variable `SQLITE_FILE` with the path to use for the db (you should still initialise it yourself if needed), as well as a `DISCORD_WEBHOOK_URL` to send user messages to.

Do remember, that data that is soft-deleted/not-public should not be sent out of the backend except if the current user has rights on it, and they should not be included in statistics as well.
