import crypto from "crypto";

/**
 * Generates a secure RSA-2048 Public/Private Keypair in PEM format.
 */
export function generateRsaKeypair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "spki",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem"
        }
    });

    return { publicKey, privateKey };
}

/**
 * Encrypts a plain text string using AES-256-GCM symmetric encryption.
 * @param plainText The text to encrypt
 * @param key A 32-byte (256-bit) secret key Buffer
 */
export function encryptSymmetric(
    plainText: string,
    key: Buffer
): { cipherText: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(12); // GCM standard IV size is 12 bytes
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const tag = cipher.getAuthTag().toString("hex");

    return {
        cipherText: encrypted,
        iv: iv.toString("hex"),
        tag
    };
}

/**
 * Decrypts an AES-256-GCM encrypted cipher text string.
 * @param cipherText The hex-encoded encrypted string
 * @param key The 32-byte (256-bit) secret key Buffer
 * @param iv The hex-encoded Initialization Vector
 * @param tag The hex-encoded Authentication Tag
 */
export function decryptSymmetric(
    cipherText: string,
    key: Buffer,
    iv: string,
    tag: string
): string {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(tag, "hex"));
    
    let decrypted = decipher.update(cipherText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

/**
 * Encrypts a small payload (like a 32-byte AES key) using a Hospital's Public RSA Key.
 * @param plainText Payload to encrypt
 * @param publicKey PEM-formatted Public Key string
 * @returns Base64-encoded encrypted string
 */
export function encryptAsymmetric(plainText: string, publicKey: string): string {
    const buffer = Buffer.from(plainText, "utf8");
    const encrypted = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
        },
        buffer
    );

    return encrypted.toString("base64");
}

/**
 * Decrypts a payload (like a wrapped 32-byte AES key) using a Hospital's Private RSA Key.
 * @param cipherText Base64-encoded encrypted string
 * @param privateKey PEM-formatted Private Key string
 * @returns Original decrypted plain text
 */
export function decryptAsymmetric(cipherText: string, privateKey: string): string {
    const buffer = Buffer.from(cipherText, "base64");
    const decrypted = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
        },
        buffer
    );

    return decrypted.toString("utf8");
}

/**
 * Encrypts a plaintext string and packs it as a colon-separated string: "iv:tag:ciphertext".
 */
export function encryptPacked(plainText: string, key: Buffer): string {
    const { cipherText, iv, tag } = encryptSymmetric(plainText, key);
    return `${iv}:${tag}:${cipherText}`;
}

/**
 * Decrypts a packed string formatted as "iv:tag:ciphertext".
 */
export function decryptPacked(packedText: string, key: Buffer): string {
    if (!packedText) return "";
    const parts = packedText.split(":");
    if (parts.length !== 3) {
        // Return as is if it's not encrypted (for backward compatibility / fallback)
        return packedText;
    }
    const [iv, tag, cipherText] = parts;
    return decryptSymmetric(cipherText, key, iv, tag);
}
