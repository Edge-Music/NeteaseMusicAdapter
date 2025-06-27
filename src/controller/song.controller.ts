import { Context, Controller, Get, Inject, Put, Query } from '@midwayjs/core';
import { transformPrivilege } from '../common/utils/transform.util';
import { top_song, song_url, lyric, likelist, like as likeSong, song_url_v1, SoundQualityType } from 'NeteaseCloudMusicApi'

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

    // 添加公告歌曲
    const announcementSong: Song = {
      id: 'free-app',
      name: '云享社是免费应用',
      tns: ['付费下载请举报'],
      artists: [{
        id: 'sun-258',
        name: '孙笑川258'
      }],
      album: {
        id: 'free-app-album',
        name: '付费请举办',
        cover: 'https://ospark.tech/images/music/free.jpg'
      },
      privilege: {
        playable: true,
        maxBitrate: 320000,
        bitrates: [320000]
      },
      duration: 4000
    }

    return [announcementSong, ...data];
  }

  @Get('/detail')
  async getSongDetail(@Query('id') id: id, @Query('uid') uid: id, @Query('br') br: Bitrate = 320000) {
    // 处理公告歌曲
    if (id === 'free-app') {
      return {
        id: 'free-app',
        meta: {
          url: 'https://ospark.tech/music/free.mp3',
          md5: 'd4548f39c68a3b57439c766299d3abca',
          size: 76486,
          bitrate: 320000,
          isFavorite: false,
          lyric: {
            normal: '[00:00.00]云享社是免费软件，若您是付费下载，请进行举报。',
            translation: '',
            transliteration: ''
          }
        }
      }
    }

    // 根据 br 参数决定使用哪个接口
    const urlPromise = br === 999900
      ? song_url_v1({ id, level: SoundQualityType.jyeffect, ...this.ctx.base_parms })
      : song_url({ id, br, ...this.ctx.base_parms });

    const [url_result, lrc, like_ids] = await Promise.all([
      urlPromise,
      lyric({ id, ...this.ctx.base_parms }),
      likelist({ uid, ...this.ctx.base_parms })
    ]);
    const lry_result = lrc.body as any;

    const data: Song = {
      id,
      meta: {
        url: url_result.body.data[0].url,
        md5: url_result.body.data[0].md5,
        size: url_result.body.data[0].size,
        bitrate: url_result.body.data[0].br,
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
