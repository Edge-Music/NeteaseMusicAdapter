import { Context, Controller, Get, Inject, Put, Query } from '@midwayjs/core';
import { transformPrivilege } from '../common/utils/transform.util';
import { top_song, song_url, lyric, likelist, like as likeSong, song_url_v1, SoundQualityType, TopSongType } from 'NeteaseCloudMusicApi'

@Controller('/song')
export class SongController {
  @Inject()
  ctx: Context;

  @Get('/recommend')
  async getRecommendSongs(@Query('limit') limit: number = 10) {
    const result = await top_song({
      type: TopSongType.all,
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

    return [...data];
  }

  @Get('/detail')
  async getSongDetail(@Query('id') id: id, @Query('uid') uid: id, @Query('br') br: Bitrate = 320000) {
    const promoMap = {
      'promo_color': 'browser:https://appgallery.huawei.com/app/detail?id=zone.yby.color',
      'promo_mind': 'browser:https://appgallery.huawei.com/app/detail?id=zone.yby.mind',
      'promo_mqtt': 'browser:https://appgallery.huawei.com/app/detail?id=zone.yby.mqtt',
      'promo_notice_1': 'text:谢谢支持',
      'promo_notice_2': 'text:云享社承诺无广告，若您觉得这个歌单碍眼可以在数据源地址后面加上?nopromo=1进行取消。',
    };

    if (promoMap[id as string]) {
      return {
        id,
        meta: {
          url: promoMap[id as string],
          md5: '',
          size: 0,
          bitrate: 320000,
          isFavorite: false,
          lyric: {
            normal: '点击跳转应用商店支持',
            translation: '',
            transliteration: ''
          }
        }
      } as Song;
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
