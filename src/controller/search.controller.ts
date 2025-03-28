import { Context, Controller, Get, Inject, Query } from '@midwayjs/core';
import { cloudsearch } from 'NeteaseCloudMusicApi'
import { transformAlbums, transformArtists, transformPlaylists, transformSongs } from '../common/utils/transform.util';


@Controller('/search')
export class SearchController {
  @Inject()
  ctx: Context;

  @Get('/')
  async search(@Query('limit') limit = 10, @Query('keywords') keywords: string) {
    // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单
    const [song, album, artist, playlist] = await Promise.all([
      cloudsearch({
        keywords,
        type: 1,
        limit,
        ...this.ctx.base_parms
      }),
      cloudsearch({
        keywords,
        type: 10,
        limit,
        ...this.ctx.base_parms
      }),
      cloudsearch({
        keywords,
        type: 100,
        limit,
        ...this.ctx.base_parms
      }),
      cloudsearch({
        keywords,
        type: 1000,
        limit,
        ...this.ctx.base_parms
      })
    ]);

    const song_data = (song.body.result as any)?.songs
    const album_data = (album.body.result as any)?.albums
    const artist_data = (artist.body.result as any)?.artists
    const playlist_data = (playlist.body.result as any)?.playlists

    return {
      songs: transformSongs(song_data),
      albums: transformAlbums(album_data),
      artists: transformArtists(artist_data),
      playlists: transformPlaylists(playlist_data)
    }
  }
}
