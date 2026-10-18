// ============================================================
// Editron — Encoder / Decoder Service
// ============================================================

// ── Base64 ────────────────────────────────────────────────────
export function base64Encode(input: string): string {
  try {
    // Handle Unicode properly with TextEncoder
    const encoder = new TextEncoder();
    const bytes = encoder.encode(input);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  } catch {
    throw new Error('Failed to Base64 encode the input');
  }
}

export function base64Decode(input: string): string {
  try {
    const binary = atob(input.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    throw new Error('Invalid Base64 string');
  }
}

// ── URL Encode/Decode ─────────────────────────────────────────
export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    throw new Error('Invalid URL-encoded string');
  }
}

// ── HTML Entity Encode/Decode ─────────────────────────────────
export function htmlEncode(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;',
  };
  return input.replace(/[&<>"']/g, (c) => map[c] || c);
}

export function htmlDecode(input: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
}

// ── Unicode Escape/Unescape ───────────────────────────────────
export function unicodeEscape(input: string): string {
  return Array.from(input)
    .map((char) => {
      const code = char.codePointAt(0);
      if (code === undefined) return char;
      if (code > 0xffff) {
        return `\\u{${code.toString(16).toUpperCase()}}`;
      }
      if (code > 0x7f) {
        return `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
      }
      return char;
    })
    .join('');
}

export function unicodeUnescape(input: string): string {
  return input
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// ── JWT Decode ────────────────────────────────────────────────
export interface JWTDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt: string | null;
  issuedAt: string | null;
}

function base64UrlDecode(str: string): string {
  // Add padding
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return base64Decode(base64);
}

export function jwtDecode(token: string): JWTDecoded {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: expected 3 parts separated by dots');
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    
    const exp = payload.exp ? new Date(payload.exp * 1000) : null;
    const iat = payload.iat ? new Date(payload.iat * 1000) : null;

    return {
      header,
      payload,
      signature: parts[2],
      isExpired: exp ? exp.getTime() < Date.now() : false,
      expiresAt: exp ? exp.toISOString() : null,
      issuedAt: iat ? iat.toISOString() : null,
    };
  } catch {
    throw new Error('Failed to decode JWT: invalid Base64 or JSON content');
  }
}

// ── Hash Generator ────────────────────────────────────────────
export async function generateHash(input: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  const algoMap: Record<string, string> = {
    'MD5': 'MD5',
    'SHA-1': 'SHA-1',
    'SHA-256': 'SHA-256',
    'SHA-384': 'SHA-384',
    'SHA-512': 'SHA-512',
  };

  const algo = algoMap[algorithm];
  if (!algo) throw new Error(`Unsupported algorithm: ${algorithm}`);

  // Note: MD5 not supported by SubtleCrypto; use a fallback
  if (algo === 'MD5') {
    return md5(input);
  }

  const hashBuffer = await crypto.subtle.digest(algo, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Simple MD5 implementation for client-side use
function md5(input: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff);
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    let r = safeAdd(safeAdd(a, q), safeAdd(x, t));
    return safeAdd((r << s) | (r >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

  const bytes = new TextEncoder().encode(input);
  const n = bytes.length;
  const words: number[] = [];
  for (let i = 0; i < n; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) << 3);
  }
  words[n >> 2] |= 0x80 << ((n % 4) << 3);
  const totalLen = (((n + 8) >>> 6) + 1) * 16;
  for (let i = words.length; i < totalLen; i++) words[i] = 0;
  words[totalLen - 2] = n * 8;
  
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  
  for (let i = 0; i < totalLen; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a,b,c,d,words[i],7,-680876936);d = ff(d,a,b,c,words[i+1],12,-389564586);c = ff(c,d,a,b,words[i+2],17,606105819);b = ff(b,c,d,a,words[i+3],22,-1044525330);
    a = ff(a,b,c,d,words[i+4],7,-176418897);d = ff(d,a,b,c,words[i+5],12,1200080426);c = ff(c,d,a,b,words[i+6],17,-1473231341);b = ff(b,c,d,a,words[i+7],22,-45705983);
    a = ff(a,b,c,d,words[i+8],7,1770035416);d = ff(d,a,b,c,words[i+9],12,-1958414417);c = ff(c,d,a,b,words[i+10],17,-42063);b = ff(b,c,d,a,words[i+11],22,-1990404162);
    a = ff(a,b,c,d,words[i+12],7,1804603682);d = ff(d,a,b,c,words[i+13],12,-40341101);c = ff(c,d,a,b,words[i+14],17,-1502002290);b = ff(b,c,d,a,words[i+15],22,1236535329);
    a = gg(a,b,c,d,words[i+1],5,-165796510);d = gg(d,a,b,c,words[i+6],9,-1069501632);c = gg(c,d,a,b,words[i+11],14,643717713);b = gg(b,c,d,a,words[i],20,-373897302);
    a = gg(a,b,c,d,words[i+5],5,-701558691);d = gg(d,a,b,c,words[i+10],9,38016083);c = gg(c,d,a,b,words[i+15],14,-660478335);b = gg(b,c,d,a,words[i+4],20,-405537848);
    a = gg(a,b,c,d,words[i+9],5,568446438);d = gg(d,a,b,c,words[i+14],9,-1019803690);c = gg(c,d,a,b,words[i+3],14,-187363961);b = gg(b,c,d,a,words[i+8],20,1163531501);
    a = gg(a,b,c,d,words[i+13],5,-1444681467);d = gg(d,a,b,c,words[i+2],9,-51403784);c = gg(c,d,a,b,words[i+7],14,1735328473);b = gg(b,c,d,a,words[i+12],20,-1926607734);
    a = hh(a,b,c,d,words[i+5],4,-378558);d = hh(d,a,b,c,words[i+8],11,-2022574463);c = hh(c,d,a,b,words[i+11],16,1839030562);b = hh(b,c,d,a,words[i+14],23,-35309556);
    a = hh(a,b,c,d,words[i+1],4,-1530992060);d = hh(d,a,b,c,words[i+4],11,1272893353);c = hh(c,d,a,b,words[i+7],16,-155497632);b = hh(b,c,d,a,words[i+10],23,-1094730640);
    a = hh(a,b,c,d,words[i+13],4,681279174);d = hh(d,a,b,c,words[i],11,-358537222);c = hh(c,d,a,b,words[i+3],16,-722521979);b = hh(b,c,d,a,words[i+6],23,76029189);
    a = hh(a,b,c,d,words[i+9],4,-640364487);d = hh(d,a,b,c,words[i+12],11,-421815835);c = hh(c,d,a,b,words[i+15],16,530742520);b = hh(b,c,d,a,words[i+2],23,-995338651);
    a = ii(a,b,c,d,words[i],6,-198630844);d = ii(d,a,b,c,words[i+7],10,1126891415);c = ii(c,d,a,b,words[i+14],15,-1416354905);b = ii(b,c,d,a,words[i+5],21,-57434055);
    a = ii(a,b,c,d,words[i+12],6,1700485571);d = ii(d,a,b,c,words[i+3],10,-1894986606);c = ii(c,d,a,b,words[i+10],15,-1051523);b = ii(b,c,d,a,words[i+1],21,-2054922799);
    a = ii(a,b,c,d,words[i+8],6,1873313359);d = ii(d,a,b,c,words[i+15],10,-30611744);c = ii(c,d,a,b,words[i+6],15,-1560198380);b = ii(b,c,d,a,words[i+13],21,1309151649);
    a = ii(a,b,c,d,words[i+4],6,-145523070);d = ii(d,a,b,c,words[i+11],10,-1120210379);c = ii(c,d,a,b,words[i+2],15,718787259);b = ii(b,c,d,a,words[i+9],21,-343485551);
    a = safeAdd(a, oa); b = safeAdd(b, ob); c = safeAdd(c, oc); d = safeAdd(d, od);
  }

  const hex = (n: number) => {
    let s = '';
    for (let i = 0; i < 4; i++) s += ((n >> (i * 8 + 4)) & 0xf).toString(16) + ((n >> (i * 8)) & 0xf).toString(16);
    return s;
  };
  return hex(a) + hex(b) + hex(c) + hex(d);
}

// ── Character Inspector ───────────────────────────────────────
export interface CharInfo {
  char: string;
  codePoint: number;
  hex: string;
  name: string;
  block: string;
  utf8Bytes: number;
}

export function inspectCharacter(char: string): CharInfo {
  const codePoint = char.codePointAt(0) || 0;
  const hex = `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
  
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(char).length;

  // Block detection (simplified)
  let block = 'Unknown';
  if (codePoint <= 0x007f) block = 'Basic Latin';
  else if (codePoint <= 0x00ff) block = 'Latin-1 Supplement';
  else if (codePoint <= 0x024f) block = 'Latin Extended';
  else if (codePoint <= 0x02af) block = 'IPA Extensions';
  else if (codePoint <= 0x036f) block = 'Combining Diacritical Marks';
  else if (codePoint <= 0x03ff) block = 'Greek and Coptic';
  else if (codePoint <= 0x04ff) block = 'Cyrillic';
  else if (codePoint <= 0x097f) block = 'Devanagari';
  else if (codePoint <= 0x0fff) block = 'Other Indic Scripts';
  else if (codePoint <= 0x1fff) block = 'Extended Scripts';
  else if (codePoint <= 0x206f) block = 'General Punctuation';
  else if (codePoint <= 0x27bf) block = 'Symbols';
  else if (codePoint <= 0x2bff) block = 'Miscellaneous Symbols';
  else if (codePoint <= 0x2fff) block = 'CJK Radicals';
  else if (codePoint <= 0x9fff) block = 'CJK Unified Ideographs';
  else if (codePoint <= 0xd7ff) block = 'Hangul Syllables';
  else if (codePoint <= 0xffff) block = 'BMP Misc';
  else if (codePoint <= 0x1f9ff) block = 'Emoji / Symbols';
  else block = 'Supplementary Planes';

  return { char, codePoint, hex, name: `Character ${hex}`, block, utf8Bytes };
}

// ── Text statistics ───────────────────────────────────────────
export interface TextStats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  lines: number;
  bytes: number;
  paragraphs: number;
}

export function getTextStats(text: string): TextStats {
  const encoder = new TextEncoder();
  return {
    chars: [...text].length,
    charsNoSpaces: [...text.replace(/\s/g, '')].length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.split('\n').length,
    bytes: encoder.encode(text).length,
    paragraphs: text.trim() ? text.trim().split(/\n\s*\n/).length : 0,
  };
}
