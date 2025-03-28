import { Context, Controller, Get, Inject, Put, Query } from '@midwayjs/core';
import { transformPrivilege } from '../common/utils/transform.util';
import { top_song, song_url, lyric, likelist, like as likeSong } from 'NeteaseCloudMusicApi'

@Controller('/song')
export class SongController {
  @Inject()
  ctx: Context;

  @Get('/recommend')
  async getRecommendSongs(@Query('limit') limit: number = 10) {
    const result = await top_song({
      type: 0,
      ...this.ctx.base_parms
    });
    const data: Song[] = (result.body.data as any[]).slice(0, limit).map((item) => {
      return {
        id: item.id,
        name: item.name,
        tns: item.tns || item.alias,
        artists: item.artists.map((ar) => {
          return {
            id: ar.id,
            name: ar.name
          } as Artist
        }),
        album: {
          id: item.album.id,
          name: item.album.name,
          cover: item.album.picUrl
        } as Album,
        privilege: transformPrivilege(item.privilege),
        duration: item.duration
      }
    })
    return data;
  }

  @Get('/detail')
  async getSongDetail(@Query('id') id: id, @Query('uid') uid: id, @Query('br') br: Bitrate = 320000) {
    const [url, lrc, like_ids] = await Promise.all([
      song_url({ id, br, ...this.ctx.base_parms }),
      lyric({ id, ...this.ctx.base_parms }),
      likelist({ uid, ...this.ctx.base_parms })
    ]);
    const lry_result = lrc.body as any;
    const url_result = url.body.data[0];

    const data: Song = {
      id,
      meta: {
        url: url_result.url,
        md5: url_result.md5,
        size: url_result.size,
        bitrate: url_result.br,
        isFavorite: (like_ids.body.ids as any[]).includes(Number(id)),
        lyric: {
          normal: lry_result.lrc?.lyric ?? '',
          translation: lry_result.tlyric?.lyric ?? '',
          transliteration: lry_result.romalrc?.lyric ?? ''
        }
      }
    }
    return data;
  }

  @Put('/like')
  async likeSong(@Query('id') id: id, @Query('like') like: boolean = true) {
    const result = await likeSong({
      id,
      like: `${like}`,
      ...this.ctx.base_parms
    });
    const data = result.body as any;
    return {
      id,
      like,
      playlist: data.playlistId
    }
  }
}
