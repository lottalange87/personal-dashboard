"use client";

// E2E Encryption for notes using Web Crypto API
const ENCRYPTION_KEY_NAME = "dashboard_encryption_key";

export async function deriveKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Import password as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordData,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  
  // Derive actual encryption key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("dashboard_salt_v1"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  
  return key;
}

export async function encryptNote(plaintext: string, password: string): Promise<string> {
  const key = await deriveKey(password);
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  
  // Combine IV + ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function decryptNote(ciphertext: string, password: string): Promise<string> {
  try {
    const key = await deriveKey(password);
    
    // Decode base64
    const combined = new Uint8Array(
      atob(ciphertext)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    
    // Extract IV and ciphertext
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (e) {
    throw new Error("Failed to decrypt - wrong password or corrupted data");
  }
}

// Simple hash for verification
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}
