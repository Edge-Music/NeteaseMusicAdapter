const NETEASE_YRC_LINE_REGEXP = /^\[(\d+),(\d+)\](.*)$/;

const isNetEaseMetadataLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return false;
  }

  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed?.t === 'number' && Array.isArray(parsed?.c);
  } catch {
    return false;
  }
};

const formatEnhancedLrcTimestamp = (timeMs: number) => {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor(timeMs / 1000) % 60;
  const centiseconds = Math.floor((timeMs % 1000) / 10);

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
};

export const normalizeNetEaseLyric = (lyric?: string | null) => {
  if (!lyric) {
    return '';
  }

  const lines = lyric.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  let startIndex = 0;

  while (startIndex < lines.length) {
    const currentLine = lines[startIndex].trim();
    if (!currentLine || isNetEaseMetadataLine(currentLine)) {
      startIndex += 1;
      continue;
    }
    break;
  }

  return lines.slice(startIndex).join('\n');
};

export const convertNetEaseYrcToEnhancedLrc = (lyric?: string | null) => {
  const normalizedLyric = normalizeNetEaseLyric(lyric);
  if (!normalizedLyric) {
    return '';
  }

  return normalizedLyric
    .split('\n')
    .map(line => {
      if (!line.trim()) {
        return '';
      }

      const lineMatch = line.match(NETEASE_YRC_LINE_REGEXP);
      if (!lineMatch) {
        return line;
      }

      const lineStart = Number(lineMatch[1]);
      const content = lineMatch[3] ?? '';
      const tokens: string[] = [];
      const tokenRegExp = /\((\d+),(\d+),(\d+)\)(.*?)(?=\(\d+,\d+,\d+\)|$)/g;
      let tokenMatch: RegExpExecArray | null;

      while ((tokenMatch = tokenRegExp.exec(content)) !== null) {
        const tokenStart = Number(tokenMatch[1]);
        const text = tokenMatch[4] ?? '';
        tokens.push(`(${Math.max(0, tokenStart - lineStart)})${text}`);
      }

      const timestamp = formatEnhancedLrcTimestamp(lineStart);
      return tokens.length > 0 ? `[${timestamp}]${tokens.join('')}` : `[${timestamp}]`;
    })
    .join('\n');
};
