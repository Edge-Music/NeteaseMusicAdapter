import { Context, Controller, Get, Inject, Query } from '@midwayjs/core';
import { personalized, user_playlist, toplist, playlist_detail_dynamic, recommend_songs, personal_fm, user_cloud, playmode_intelligence_list, likelist } from 'NeteaseCloudMusicApi'
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
      id: "key_daily_songs",
      name: "今日日推推荐",
      cover: `https://ui-avatars.com/api/?bold=true&name=${new Date().getDate()}&size=300`,
      type: "normal",
      description: "根据你的音乐口味生成，每天更新",
      creator: {
        id: uid,
        name: "云享社",
        avatar: ""
      }
    }
    const personal_fm: Playlist = {
      id: "key_personal_fm",
      name: "私人FM",
      cover: "https://ui-avatars.com/api/?bold=true&name=FM&size=300",
      type: "normal",
      description: "一天逛五次私人FM，每次都有新感觉",
      creator: {
        id: uid,
        name: "云享社",
        avatar: ""
      }
    }
    const cloud_disk: Playlist = {
      id: "key_cloud_disk",
      name: "音乐云盘",
      cover: "https://ui-avatars.com/api/?bold=true&name=Cloud&size=300",
      type: "normal",
      description: "你的私人音乐云盘",
      creator: {
        id: uid,
        name: "云享社",
        avatar: ""
      }
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
    return data.length > 0
      ? [
        daily_songs,
        personal_fm,
        cloud_disk,
        {
          id: `key_heartbeat_${data[0].id}_${uid}`,
          name: "心动歌单",
          cover: "https://ui-avatars.com/api/?bold=true&name=Heart&size=300",
          type: "normal",
          description: "记录你的心动时刻",
          creator: {
            id: uid,
            name: "云享社",
            avatar: ""
          }
        },
        ...data
      ]
      : [daily_songs, personal_fm, cloud_disk, ...data];
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
    if (id.toString().startsWith('key_')) {
      if (id === 'key_daily_songs' || id === 'daily_songs') {
        const result = await recommend_songs({
          ...this.ctx.base_parms
        });
        const daily_songs = (result.body.data as any).dailySongs;
        return {
          id: id,
          songs: transformSongs(daily_songs),
          meta: {}
        } as Playlist
      } else if (id === 'key_personal_fm') {
        // 获取15首私人FM歌曲
        const songs = [];
        for (let i = 0; i < 5; i++) {
          const result = await personal_fm({
            ...this.ctx.base_parms
          });
          const fm_songs = (result.body.data as any[]).map(song => {
            return {
              ...song,
              ar: song.artists,
              al: song.album
            };
          });
          songs.push(...fm_songs);
        }
        return {
          id: 'key_personal_fm',
          songs: transformSongs(songs),
          meta: {}
        } as Playlist
      } else if (id === 'key_cloud_disk') {
        const result = await user_cloud({
          limit,
          ...this.ctx.base_parms
        });
        const cloud_songs = (result.body.data as any[]).map(item => {
          return {
            ...item.simpleSong,
            ar: item.simpleSong.ar || [{ id: 0, name: item.artist || "未知艺术家" }],
            al: {
              id: 0,
              name: item.album || "未知专辑",
              picUrl: item.simpleSong.al?.picUrl || "http://p2.music.126.net/0ju8ET1ApZSXfWacc4w49w==/109951169484091680.jpg"
            }
          };
        });
        return {
          id: 'key_cloud_disk',
          songs: transformSongs(cloud_songs),
          meta: {
            size: result.body.size,
            maxSize: result.body.maxSize
          }
        } as Playlist
      } else if (id.toString().startsWith('key_heartbeat_')) {
        const pid_uid = id.toString().slice(14);
        const pid = pid_uid.split('_')[0];
        const uid = pid_uid.split('_')[1];
        const likelist_result = await likelist({
          uid,
          ...this.ctx.base_parms
        });
        const sid = likelist_result.body.ids[0];
        console.log(sid);
        const intelligence_list_result = await playmode_intelligence_list({
          id: sid,
          sid: Number(sid),
          pid: Number(pid),
          count: 100,
          ...this.ctx.base_parms
        });
        const data = (intelligence_list_result.body.data as any[])?.map(item => item.songInfo).filter(Boolean) ?? [];
        return {
          id: id,
          songs: transformSongs(data),
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
