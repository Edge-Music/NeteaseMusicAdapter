import { convertNetEaseYrcToEnhancedLrc, normalizeNetEaseLyric } from '../../../src/common/utils/lyric.util';

describe('lyric.util', () => {
  it('should remove leading NetEase metadata lines from lyric', () => {
    const lyric = [
      '{"t":0,"c":[{"tx":"作曲: "},{"tx":"柳重言"}]}',
      '{"t":5403,"c":[{"tx":"编曲: "},{"tx":"Alex San"}]}',
      '[00:12.30]这里是歌词',
      '[00:15.00]第二行',
    ].join('\n');

    expect(normalizeNetEaseLyric(lyric)).toBe('[00:12.30]这里是歌词\n[00:15.00]第二行');
  });

  it('should keep normal lyric unchanged when metadata is absent', () => {
    const lyric = '[00:12.30]这里是歌词\n[00:15.00]第二行';

    expect(normalizeNetEaseLyric(lyric)).toBe(lyric);
  });

  it('should convert NetEase yrc to enhanced lrc', () => {
    const lyric = [
      '{"t":0,"c":[{"tx":"作曲: "},{"tx":"柳重言"}]}',
      '[12300,1400](12300,200,0)这(12500,200,0)里(12700,200,0)是(12900,200,0)歌(13100,600,0)词',
    ].join('\n');

    expect(convertNetEaseYrcToEnhancedLrc(lyric)).toBe('[00:12.30](0)这(200)里(400)是(600)歌(800)词');
  });
});
