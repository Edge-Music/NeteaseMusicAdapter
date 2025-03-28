type Bitrate = number;

interface Privilege {
  // 是否可播放
  playable: boolean;
  // 原因
  reason?: string;
  // 码率列表
  bitrates?: Bitrate[];
  // 当前用户最高码率
  maxBitrate?: Bitrate;
}

interface SongMeta {
  // 歌曲URL
  url?: string;
  // 是否喜欢
  isFavorite?: boolean;
  // 歌词
  lyric?: Lyric;
  [key: string]: any;
}

interface Song {
  // 歌曲ID
  id: id;
  // 歌曲名称
  name?: string;
  // 别名
  tns?: string[];
  // 歌手列表
  artists?: Artist[];
  // 专辑
  album?: Album;
  // 时长
  duration?: number;
  // 是否可播放
  privilege?: Privilege;
  // 其他元数据
  meta?: SongMeta;
}

interface Artist {
  // 歌手ID
  id: id;
  // 歌手名称
  name: string;
  // 歌手封面
  avatar?: string;
}

interface Album {
  // 专辑ID
  id: id;
  // 专辑名称
  name: string;
  // 专辑封面
  cover?: string;
  // 歌手
  artists?: Artist[];
  // size
  size?: number;
}

interface Lyric {
  // 正常歌词
  normal?: string;
  // 音译歌词
  transliteration?: string;
  // 翻译歌词
  translation?: string;
}
