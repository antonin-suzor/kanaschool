export interface User {
    id: number;
    name: string;
    password_hash: string;
    is_public: boolean;
    description: string | null;
    avatar_key: string | null;
    banner_key: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface AuthUser {
    id: number;
    name: string;
    is_public: boolean;
}

export interface PublicProfile {
    id: number;
    name: string;
    is_public: number;
    description: string | null;
    avatar_key: string | null;
    banner_key: string | null;
    created_at: string;
    updated_at: string;
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
