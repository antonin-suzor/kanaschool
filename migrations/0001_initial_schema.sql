CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_public INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    is_public INTEGER DEFAULT 0,
    hiragana INTEGER DEFAULT 1,
    katakana INTEGER DEFAULT 1,
    mods INTEGER DEFAULT 1,
    mult INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    finished_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS kanas (
    id INTEGER PRIMARY KEY,
    reading TEXT NOT NULL,
    is_katakana INTEGER DEFAULT 0,
    mod INTEGER DEFAULT 0,
    consonant_line TEXT NOT NULL,
    vowel_column TEXT NOT NULL,
    unicode TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session_kanas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    kana_id INTEGER NOT NULL,
    mult_position INTEGER DEFAULT 1,
    submitted_at TEXT NOT NULL,
    is_correct INTEGER DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (kana_id) REFERENCES kanas(id)
);

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_deleted_at ON sessions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_kanas_reading ON kanas(reading);
CREATE INDEX IF NOT EXISTS idx_kanas_is_katakana ON kanas(is_katakana);
CREATE INDEX IF NOT EXISTS idx_session_kanas_session_id ON session_kanas(session_id);
CREATE INDEX IF NOT EXISTS idx_session_kanas_kana_id ON session_kanas(kana_id);
