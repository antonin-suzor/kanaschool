export interface User {
    id: number;
    name: string;
    password_hash: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface AuthUser {
    id: number;
    name: string;
    is_public: boolean;
}

export interface Kana {
    id: number;
    reading: string;
    is_katakana: boolean;
    mod: number;
    consonant_line: string;
    vowel_column: string;
    unicode: string;
}
