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

  // 获取已有的tracks和privileges
  let tracks = response.playlist.tracks || [];
  let privileges = response.privileges || [];

  // 获取所有trackIds
  let trackIds = response.playlist.trackIds || [];

  // 应用limit参数
  if (parameter.limit !== undefined && parameter.limit < trackIds.length) {
    trackIds = trackIds.slice(0, parameter.limit);
    // 如果已有的tracks也需要限制
    if (tracks.length > parameter.limit) {
      tracks = tracks.slice(0, parameter.limit);
      privileges = privileges.slice(0, parameter.limit);
    }
  }

  // 如果已有的tracks数量与trackIds相同，则直接返回现有数据
  if (tracks.length === trackIds.length) {
    return {
      songs: tracks,
      privileges: privileges
    };
  }

  // 创建一个已有歌曲ID的映射，避免重复请求
  const existingTrackIds = new Set(tracks.map(track => track.id));

  // 找出需要额外获取的歌曲ID
  const missingTrackIds = trackIds
    .filter(track => !existingTrackIds.has(track.id))
    .map(track => track.id);

  // 如果没有缺失的歌曲，直接返回现有数据
  if (missingTrackIds.length === 0) {
    return {
      songs: tracks,
      privileges: privileges
    };
  }

  // 结果数组，初始化为已有的数据
  const allSongs = [...tracks];
  const allPrivileges = [...privileges];

  // 分批处理缺失的歌曲，每批最多1000首歌
  const BATCH_SIZE = 1000;
  const batchCount = Math.ceil(missingTrackIds.length / BATCH_SIZE);

  for (let i = 0; i < batchCount; i++) {
    // 获取当前批次的track ids
    const batchIds = missingTrackIds
      .slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
      .join(',');

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

  // 根据原始trackIds的顺序排序结果
  const trackIdOrder = new Map<number, number>();

  // 确保trackIds中的id是数字类型
  trackIds.forEach((track, index) => {
    const id = typeof track.id === 'string' ? parseInt(track.id, 10) : Number(track.id);
    trackIdOrder.set(id, index);
  });

  allSongs.sort((a, b) => {
    const aId = typeof a.id === 'string' ? parseInt(a.id, 10) : Number(a.id);
    const bId = typeof b.id === 'string' ? parseInt(b.id, 10) : Number(b.id);
    const aIndex = trackIdOrder.get(aId);
    const bIndex = trackIdOrder.get(bId);

    return (aIndex !== undefined ? aIndex : 0) - (bIndex !== undefined ? bIndex : 0);
  });

  allPrivileges.sort((a, b) => {
    const aId = typeof a.id === 'string' ? parseInt(a.id, 10) : Number(a.id);
    const bId = typeof b.id === 'string' ? parseInt(b.id, 10) : Number(b.id);
    const aIndex = trackIdOrder.get(aId);
    const bIndex = trackIdOrder.get(bId);

    return (aIndex !== undefined ? aIndex : 0) - (bIndex !== undefined ? bIndex : 0);
  });

  return {
    songs: allSongs,
    privileges: allPrivileges
  };
};
