/**
 * 网易云音乐歌曲信息转换
 */
export const transformSong = (song: any): Song => {
  return {
    id: song.id,
    name: song.name,
    artists: song.ar.map((ar: any) => {
      return {
        id: ar.id,
        name: ar.name
      } as Artist
    }),
    album: {
      id: song.al.id,
      name: song.al.name,
      cover: song.al.picUrl
    } as Album,
    tns: song.tns,
    duration: song.dt,
    // 如果有privilege字段也进行转换
    privilege: song.privilege ? transformPrivilege(song.privilege) : undefined
  } as Song
}

/**
 * 网易云音乐歌曲列表信息转换
 * @param songs 歌曲列表
 * @returns 歌曲列表
 */
export const transformSongs = (songs: any[]) => {
  return songs.map((song) => transformSong(song));
}

export const transformSongsAndPrivilege = (songs: any[], privileges: any[]) => {
  const privilegeMap = new Map<number, any>();
  privileges?.forEach((privilege) => {
    privilegeMap.set(privilege.id, privilege);
  });
  return songs.map((song) => {
    return {
      ...transformSong(song),
      privilege: transformPrivilege(privilegeMap.get(song.id))
    }
  });
}

/**
 * 网易云音乐权限信息转换
 * @param privilege 权限信息
 * @returns 权限信息
 */
export const transformPrivilege = (privilege: any) => {
  const maxBr = privilege.pl || privilege.playMaxbr;
  const playable = privilege.st === 0;
  return {
    playable: playable,
    reason: playable ? undefined : '无相应播放权限',
    maxBitrate: maxBr,
    bitrates: (privilege.chargeInfoList as any[])?.filter((chargeInfo: any) => chargeInfo.rate <= maxBr || chargeInfo.chargeType === 0).map((chargeInfo: any) => chargeInfo.rate)
  } as Privilege
}

/**
 * 网易云音乐歌单信息转换
 * @param playlist 歌单信息
 * @returns 歌单信息
 */
export const transformPlaylist = (playlist: any): Playlist => {
  return {
    id: playlist.id,
    name: playlist.name,
    cover: playlist.coverImgUrl,
    size: playlist.trackCount,
    type: playlist.type,
    description: playlist.description,
    meta: {
      subscribed: playlist.subscribed
    }
  } as Playlist
}


/**
 * 网易云音乐歌单列表信息转换
 * @param playlists 歌单列表
 * @returns 歌单列表
 */
export const transformPlaylists = (playlists: any[]) => {
  return playlists.map((playlist) => transformPlaylist(playlist));
}


/**
 * 网易云音乐专辑信息转换
 * @param album 专辑信息
 * @returns 专辑信息
 */
export const transformAlbum = (album: any): Album => {
  return {
    id: album.id,
    name: album.name,
    cover: album.picUrl,
    size: album.size,
    description: album.description,
    artists: album.artists.map((artist: any) => {
      return {
        id: artist.id,
        name: artist.name
      } as Artist
    })
  } as Album
}

/**
 * 网易云音乐专辑列表信息转换
 * @param albums 专辑列表
 * @returns 专辑列表
 */
export const transformAlbums = (albums: any[]) => {
  return albums.map((album) => transformAlbum(album));
}

/**
 * 网易云音乐歌手信息转换
 * @param artist 歌手信息
 * @returns 歌手信息
 */
export const transformArtist = (artist: any): Artist => {
  return {
    id: artist.id,
    name: artist.name,
    avatar: artist.picUrl
  } as Artist
}

/**
 * 网易云音乐歌手列表信息转换
 * @param artists 歌手列表
 * @returns 歌手列表
 */
export const transformArtists = (artists: any[]) => {
  return artists.map((artist) => transformArtist(artist));
}
