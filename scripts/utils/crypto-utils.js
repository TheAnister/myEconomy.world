// Utility function to generate a random string of specified length
export function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Utility function to hash a string using SHA-256
export async function hashStringSHA256(string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

// Utility function to convert a buffer to hex string
function bufferToHex(buffer) {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = [...byteArray].map(byte => {
    const hexCode = byte.toString(16);
    return hexCode.padStart(2, '0');
  });
  return hexCodes.join('');
}

// Utility function to encrypt a string using AES-GCM
export async function encryptStringAESGCM(string, key) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedString = encoder.encode(string);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encodedString
  );
  return {
    iv: bufferToHex(iv),
    ciphertext: bufferToHex(encryptedBuffer)
  };
}

// Utility function to decrypt a string using AES-GCM
export async function decryptStringAESGCM(ciphertext, key, iv) {
  const decoder = new TextDecoder();
  const ivBuffer = hexToBuffer(iv);
  const ciphertextBuffer = hexToBuffer(ciphertext);
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer
    },
    key,
    ciphertextBuffer
  );
  return decoder.decode(decryptedBuffer);
}

// Utility function to convert a hex string to buffer
function hexToBuffer(hex) {
  const byteArray = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  return byteArray.buffer;
}

// Utility function to generate an AES-GCM key
export async function generateAESGCMKey() {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Utility function to export a CryptoKey to a JSON web key
export async function exportCryptoKey(key) {
  return crypto.subtle.exportKey('jwk', key);
}

// Utility function to import a CryptoKey from a JSON web key
export async function importCryptoKey(jwk) {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'AES-GCM'
    },
    true,
    ['encrypt', 'decrypt']
  );
}
