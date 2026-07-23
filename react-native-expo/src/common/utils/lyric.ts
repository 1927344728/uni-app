import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import iconv from 'iconv-lite';

export type LyricLine = { time: number; text: string };

function decodeUtf8(buffer: ArrayBuffer): string {
  try {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(new Uint8Array(buffer));
    }
  } catch {
    // fall through
  }
  return Buffer.from(buffer).toString('utf8');
}

function decodeGbkWeb(buffer: ArrayBuffer): Promise<string> {
  return new Promise(resolve => {
    try {
      const blob = new Blob([buffer], { type: 'text/plain;charset=gbk' });
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => resolve(decodeUtf8(buffer));
      reader.readAsText(blob, 'gbk');
    } catch {
      resolve(decodeUtf8(buffer));
    }
  });
}

async function decodeLyricBuffer(buffer: ArrayBuffer): Promise<string> {
  if (Platform.OS === 'web' && typeof FileReader !== 'undefined') {
    return decodeGbkWeb(buffer);
  }
  const bytes = Buffer.from(buffer);
  const utf8 = iconv.decode(bytes, 'utf8');
  if (utf8.includes('[') && !utf8.includes('\uFFFD')) return utf8;
  return iconv.decode(bytes, 'gbk');
}

function parseLyricText(lyricText: string): LyricLine[] {
  return lyricText
    .split(/\n+/)
    .map(line => {
      const standard = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\](.*)/);
      if (standard) {
        const minute = Number(standard[1]);
        const second = Number(standard[2]);
        const rawMs = standard[3];
        let fraction = 0;
        if (rawMs) {
          const len = rawMs.length;
          fraction = len >= 3 ? Number(rawMs) / 1000 : len === 2 ? Number(rawMs) / 100 : Number(rawMs) / 10;
        }
        return { time: minute * 60 + second + fraction, text: standard[4].trim() };
      }
      const fallback = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
      if (fallback) {
        return { time: Number(fallback[1]) * 60 + Number(fallback[2]), text: fallback[3].trim() };
      }
      return null;
    })
    .filter((line): line is LyricLine => !!line?.text)
    .sort((a, b) => a.time - b.time);
}

async function fetchLyricText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) return '';
  return decodeLyricBuffer(await response.arrayBuffer());
}

export async function parseLyric(lyricSource?: unknown): Promise<LyricLine[]> {
  const source = typeof lyricSource === 'string' ? lyricSource.trim() : '';
  if (!source) return [];
  try {
    const lyricText = source.startsWith('http') ? await fetchLyricText(source) : source;
    return lyricText ? parseLyricText(lyricText) : [];
  } catch {
    return [];
  }
}

export function activeLyricIndex(lines: LyricLine[], currentTime: number): number {
  if (!lines.length) return 0;
  let index = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const next = lines[i + 1];
    if (currentTime >= lines[i].time && (!next || currentTime < next.time)) {
      index = i;
      break;
    }
    if (currentTime >= lines[i].time) index = i;
  }
  return index;
}
