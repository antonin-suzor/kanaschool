/**
 * Password hashing utilities using Web Crypto API
 * Compatible with Cloudflare Workers
 */

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);

    const bits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        key,
        256
    );

    const hashArray = new Uint8Array(bits);
    const hashHex = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    const saltHex = Array.from(salt)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    return `${saltHex}$${hashHex}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const [saltHex, hashHex] = hash.split('$');

    if (!saltHex || !hashHex) {
        return false;
    }

    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);

    const bits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        key,
        256
    );

    const hashArray = new Uint8Array(bits);
    const computedHashHex = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    return computedHashHex === hashHex;
}
