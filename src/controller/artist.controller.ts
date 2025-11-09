import { Context, Controller, Get, Inject, Query } from '@midwayjs/core';
import { toplist_artist, artists, song_detail } from 'NeteaseCloudMusicApi'
import { transformSongsAndPrivilege } from '../common/utils/transform.util';

@Controller('/artist')
export class ArtistController {
  @Inject()
  ctx: Context;

  @Get('/recommend')
  async getRecommendSongs(@Query('limit') limit: number = 10) {
    const result = await toplist_artist({
      ...this.ctx.base_parms
    });
    const data: Artist[] = ((result.body.list as any).artists as any[]).map((item) => {
      return {
        id: item.id,
        name: item.name,
        avatar: item.picUrl,
      }
    })
    data.sort(() => Math.random() - 0.5);
    return data.slice(0, limit);
  }

  @Get('/detail')
  async getArtistDetail(@Query('id') id: number) {
    const result = await artists({
      id,
      ...this.ctx.base_parms
    });
    const response = result.body as any;
    const artist = response.artist;
    let hotSongs = response.hotSongs;
    // 获取所有id
    const ids = hotSongs.map((song: any) => song.id).join(',');
    const songs = await song_detail({
      ids,
      ...this.ctx.base_parms
    });
    hotSongs = songs.body.songs;
    const privileges = songs.body.privileges;
    const data: Playlist = {
      id: artist.id,
      name: artist.name,
      cover: artist.picUrl,
      size: artist.musicSize,
      description: artist.briefDesc,
      type: "artist",
      songs: transformSongsAndPrivilege(hotSongs, privileges),
      meta: {
        subscribed: artist.followed,
      }
    }

    return data;
  }
}
