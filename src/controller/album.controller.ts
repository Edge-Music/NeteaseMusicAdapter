import { Context, Controller, Get, Inject, Query, Put } from '@midwayjs/core';
import { album, song_detail, album_sub, album_sublist } from 'NeteaseCloudMusicApi';
import { transformSongsAndPrivilege, transformArtists, transformAlbums } from '../common/utils/transform.util';

@Controller('/album')
export class AlbumController {
  @Inject()
  ctx: Context;

  @Get('/detail')
  async getAlbumDetail(@Query('id') id: number, @Query('limit') limit: number = 1000) {
    // 获取专辑详情
    const result = await album({
      id,
      ...this.ctx.base_parms
    });

    const response = result.body as any;
    const albumInfo = response.album;
    let songs = response.songs;

    // 获取歌曲id
    const ids = songs.slice(0, limit).map((song: any) => song.id).join(',');

    // 获取歌曲详情（包含权限信息）
    const songsDetail = await song_detail({
      ids,
      ...this.ctx.base_parms
    });

    songs = songsDetail.body.songs;
    const privileges = songsDetail.body.privileges;

    // 构建返回数据
    const data: Playlist = {
      id: albumInfo.id,
      name: albumInfo.name,
      cover: albumInfo.picUrl,
      size: songs.length,
      description: albumInfo.description,
      type: "album",
      songs: transformSongsAndPrivilege(songs, privileges),
      meta: {
        // 专辑特有信息
        publishTime: albumInfo.publishTime,
        subscribed: albumInfo.info.liked,
        artists: transformArtists(albumInfo.artists),
      }
    };

    return data;
  }

  @Put('/like')
  async likeAlbum(@Query('id') id: id, @Query('like') like: boolean = true) {

    await album_sub({
      id,
      t: like ? 1 : 0,
      ...this.ctx.base_parms
    });

    return {
      id,
      like,
    };
  }

  @Get('/sublist')
  async getSubAlbumList(@Query('limit') limit: number = 1000, @Query('offset') offset: number = 0) {
    // 获取已收藏专辑列表
    const result = await album_sublist({
      limit,
      offset,
      ...this.ctx.base_parms
    });

    const response = result.body as any;
    const albums = response.data;

    // 使用工具函数转换专辑数据
    const data = transformAlbums(albums);

    return data;
  }
}
