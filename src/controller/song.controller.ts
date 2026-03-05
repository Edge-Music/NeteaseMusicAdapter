import { Context, Controller, Get, Inject, Put, Query } from '@midwayjs/core';
import { transformPrivilege } from '../common/utils/transform.util';
import { top_song, lyric, likelist, like as likeSong, song_url_v1, SoundQualityType, TopSongType } from 'NeteaseCloudMusicApi'

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
  async getSongDetail(
    @Query('id') id: id,
    @Query('br') br: Bitrate | BitrateLevel = 320000
  ) {
    // 参数标准化：统一转换为 BitrateLevel
    const level = this.normalizeToLevel(br);

    const [url_result, lrc, like_ids] = await Promise.all([
      song_url_v1({ id, level, ...this.ctx.base_parms }),
      lyric({ id, ...this.ctx.base_parms }),
      likelist({ uid: -1, ...this.ctx.base_parms })
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

  private normalizeToLevel(br: Bitrate | BitrateLevel): SoundQualityType {
    if (typeof br === 'string') {
      if (br === 'vivd') return SoundQualityType.jyeffect;
      return br as SoundQualityType;
    }

    const bitrateMap: Record<number, SoundQualityType> = {
      128000: SoundQualityType.standard,
      192000: 'higher' as SoundQualityType,
      320000: SoundQualityType.exhigh,
      350000: SoundQualityType.jymaster,
      999000: SoundQualityType.jyeffect,
    };

    return bitrateMap[br] ?? SoundQualityType.standard;
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

  @Get('/lyric')
  async getLyric(@Query('id') id: id) {
    const result = await lyric({ id, ...this.ctx.base_parms });
    const data = result.body as any;
    return {
      id,
      lyric: {
        normal: data.lrc?.lyric ?? '',
        translation: data.tlyric?.lyric ?? '',
        transliteration: data.romalrc?.lyric ?? ''
      }
    }
  }

  @Get('/like')
  async getLikeStatus(@Query('id') id: id) {
    const result = await likelist({ uid: -1, ...this.ctx.base_parms });
    const data = result.body as any;
    return {
      id,
      isLiked: (data.ids as any[]).includes(Number(id))
    }
  }
}
