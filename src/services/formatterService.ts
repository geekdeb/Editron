// ============================================================
// Editron — Formatter Service (JSON / XML / YAML)
// ============================================================

import * as yaml from 'js-yaml';

// ── JSON ──────────────────────────────────────────────────────

export function jsonFormat(input: string, indent: number = 2): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, indent);
}

export function jsonMinify(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

export function jsonValidate(input: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export function jsonSortKeys(input: string, indent: number = 2): string {
  const parsed = JSON.parse(input);
  const sorted = sortObject(parsed);
  return JSON.stringify(sorted, null, indent);
}

function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    Object.keys(obj as Record<string, unknown>)
      .sort()
      .forEach((key) => {
        sorted[key] = sortObject((obj as Record<string, unknown>)[key]);
      });
    return sorted;
  }
  return obj;
}

// ── XML ───────────────────────────────────────────────────────

export function xmlFormat(input: string, indent: number = 2): string {
  const tab = ' '.repeat(indent);
  let formatted = '';
  let depth = 0;
  
  // Remove existing whitespace between tags
  const xml = input.replace(/>\s*</g, '><').trim();
  
  const tokens = xml.split(/(<[^>]+>)/g).filter(Boolean);
  
  for (const token of tokens) {
    if (token.startsWith('</')) {
      // Closing tag
      depth--;
      formatted += tab.repeat(depth) + token + '\n';
    } else if (token.startsWith('<') && token.endsWith('/>')) {
      // Self-closing tag
      formatted += tab.repeat(depth) + token + '\n';
    } else if (token.startsWith('<?') || token.startsWith('<!')) {
      // Declaration or comment
      formatted += tab.repeat(depth) + token + '\n';
    } else if (token.startsWith('<')) {
      // Opening tag
      formatted += tab.repeat(depth) + token + '\n';
      depth++;
    } else {
      // Text content
      const trimmed = token.trim();
      if (trimmed) {
        formatted = formatted.trimEnd() + trimmed + '\n';
      }
    }
  }
  
  return formatted.trim();
}

export function xmlMinify(input: string): string {
  return input
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}

export function xmlValidate(input: string): { valid: boolean; error?: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'application/xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      return { valid: false, error: errorNode.textContent || 'XML parsing error' };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

// ── YAML ──────────────────────────────────────────────────────

export function yamlFormat(input: string): string {
  const parsed = yaml.load(input);
  return yaml.dump(parsed, { indent: 2, lineWidth: 120, sortKeys: false });
}

export function yamlValidate(input: string): { valid: boolean; error?: string } {
  try {
    yaml.load(input);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export function jsonToYaml(jsonStr: string): string {
  const parsed = JSON.parse(jsonStr);
  return yaml.dump(parsed, { indent: 2, lineWidth: 120 });
}

export function yamlToJson(yamlStr: string, indent: number = 2): string {
  const parsed = yaml.load(yamlStr);
  return JSON.stringify(parsed, null, indent);
}

// ── Text Transforms ───────────────────────────────────────────

export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export function toCamelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/[\s_-]+/g, '');
}

export function toSnakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// ── Sort Lines ────────────────────────────────────────────────

export function sortLinesAsc(text: string): string {
  return text.split('\n').sort((a, b) => a.localeCompare(b)).join('\n');
}

export function sortLinesDesc(text: string): string {
  return text.split('\n').sort((a, b) => b.localeCompare(a)).join('\n');
}

export function removeDuplicateLines(text: string): string {
  return [...new Set(text.split('\n'))].join('\n');
}

export function removeEmptyLines(text: string): string {
  return text.split('\n').filter((line) => line.trim().length > 0).join('\n');
}

export function trimWhitespace(text: string): string {
  return text.split('\n').map((line) => line.trimEnd()).join('\n');
}
