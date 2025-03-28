import { Context, Controller, Get, Inject, Query } from '@midwayjs/core';
import { personalized, user_playlist, toplist, playlist_detail_dynamic, recommend_songs } from 'NeteaseCloudMusicApi'
import { transformSongs, transformSongsAndPrivilege } from '../common/utils/transform.util';
import { playlist_track_all } from '../common/utils/api.util';

@Controller('/playlist')
export class PlaylistController {
  @Inject()
  ctx: Context;

  @Get('/list')
  async getPlaylist(@Query('uid') uid: id, @Query('limit') limit: number = 1000, @Query('offset') offset: number = 0) {
    const result = await user_playlist({
      uid,
      limit,
      offset,
      ...this.ctx.base_parms
    });
    const daily_songs: Playlist = {
      id: "daily_songs",
      name: "今日日推推荐",
      cover: `https://ui-avatars.com/api/?bold=true&name=${new Date().getDate()}&size=300`,
      type: "normal",
      description: "根据你的音乐口味生成，每天更新"
    }
    const data: Playlist[] = (result.body.playlist as any[]).map((item) => {
      return {
        id: item.id,
        name: item.name,
        cover: item.coverImgUrl,
        size: item.trackCount,
        creator: {
          id: item.creator.userId,
          name: item.creator.nickname,
          avatar: item.creator.avatarUrl
        },
        type: "normal",
        description: item.description
      }
    })
    return [daily_songs, ...data];
  }

  @Get('/recommend')
  async getRecommendPlaylist(@Query('limit') limit: number = 10) {
    const result = await personalized({
      limit,
      ...this.ctx.base_parms
    });
    const data: Playlist[] = (result.body.result as any[]).map((item) => {
      return {
        id: item.id,
        name: item.name,
        cover: item.picUrl,
        size: item.trackCount,
        type: "normal",
        description: item.description,
      }
    })
    return data;
  }

  @Get('/toplist')
  async getToplist(@Query('limit') limit: number = 10) {
    const result = await toplist({
      ...this.ctx.base_parms
    });
    const data: Playlist[] = (result.body.list as any[]).slice(0, limit).map((item) => {
      return {
        id: item.id,
        name: item.name,
        cover: item.coverImgUrl,
        size: item.trackCount,
        type: "normal",
        description: item.updateFrequency
      }
    })
    return data;
  }

  @Get('/detail')
  async getPlaylistDetail(@Query('id') id: id) {
    const limit = 2000;
    const keywards: id[] = ['daily_songs']; // 保留关键字
    if (keywards.includes(id)) {
      if (id === 'daily_songs') {
        const result = await recommend_songs({
          ...this.ctx.base_parms
        });
        const daily_songs = (result.body.data as any).dailySongs;
        return {
          id: 'daily_songs',
          songs: transformSongs(daily_songs),
          meta: {}
        } as Playlist
      }
    } else {
      const [tracks_all, detail_dynamic] = await Promise.all([
        playlist_track_all({
          id: id as number, // 这里的肯定是number类型
          limit,
          ...this.ctx.base_parms,
        }),
        playlist_detail_dynamic({
          id,
          ...this.ctx.base_parms
        })
      ]);
      const tracks = tracks_all.songs as any[];
      const privileges = tracks_all.privileges as any[];
      const detail = detail_dynamic.body;
      const subscribed = detail.subscribed;

      return {
        id: id,
        songs: transformSongsAndPrivilege(tracks, privileges),
        meta: {
          subscribed
        }
      } as Playlist
    }
  }
}
