import { RequestBaseConfig, playlist_detail, song_detail } from 'NeteaseCloudMusicApi'

type track_all_params = {
  id: number;
  timestamp?: number;
  limit?: number;
} & RequestBaseConfig;

export const playlist_track_all = async (parameter: track_all_params) => {
  // 获取歌单详情
  const result = await playlist_detail({
    id: parameter.id,
    ...parameter
  });
  const response = result.body as any;

  // 获取所有trackIds
  let tracks = response.playlist.trackIds;

  // 应用limit参数
  if (parameter.limit) {
    tracks = tracks.slice(0, parameter.limit);
  }

  // 结果数组
  const allSongs: any[] = [];
  const allPrivileges: any[] = [];

  // 分批处理，每批最多1000首歌
  const BATCH_SIZE = 1000;
  const batchCount = Math.ceil(tracks.length / BATCH_SIZE);

  for (let i = 0; i < batchCount; i++) {
    // 获取当前批次的tracks
    const batchTracks = tracks.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    const batchIds = batchTracks.map((track: any) => track.id).join(',');

    // 跳过空批次
    if (!batchIds) continue;

    // 获取歌曲详情
    const songsResult = await song_detail({
      ids: batchIds,
      ...parameter
    });

    // 合并结果
    if (songsResult.body.songs) {
      allSongs.push(...songsResult.body.songs);
    }

    if (songsResult.body.privileges) {
      allPrivileges.push(...songsResult.body.privileges);
    }
  }

  return {
    songs: allSongs,
    privileges: allPrivileges
  };
};
