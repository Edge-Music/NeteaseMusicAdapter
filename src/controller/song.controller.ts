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

    // const announcementSong: Song = {
    //   id: 'pay-for-me',
    //   name: '科研乡',
    //   tns: ['隆盛江大还我血汗钱'],
    //   artists: [{
    //     id: 'yby',
    //     name: '于柏杨'
    //   }],
    //   album: {
    //     id: 'console.log',
    //     name: 'console.log',
    //     cover: 'https://public-9e72.obs.cn-north-4.myhuaweicloud.com/681aa988-ad79-49e0-b1f3-a29dc241f859.jpg'
    //   },
    //   privilege: {
    //     playable: true,
    //     maxBitrate: 320000,
    //     bitrates: [320000]
    //   },
    //   // 3分25秒
    //   duration: 205000
    // }

    return [...data];
  }

  @Get('/detail')
  async getSongDetail(@Query('id') id: id, @Query('uid') uid: id, @Query('br') br: Bitrate = 320000) {
//     // 处理公告歌曲
//     if (id === 'free-app') {
//       return {
//         id: 'free-app',
//         meta: {
//           url: 'https://ospark.tech/music/free.mp3',
//           md5: 'd4548f39c68a3b57439c766299d3abca',
//           size: 76486,
//           bitrate: 320000,
//           isFavorite: false,
//           lyric: {
//             normal: '[00:00.00]云享社是免费软件，若您是付费下载，请进行举报。',
//             translation: '',
//             transliteration: ''
//           }
//         }
//       }
//     }

//     const pay_for_me = `
//     [00:01.00]我被困在了这片混沌
// [00:03.00]说是研学合作
// [00:04.00]一轮一轮一轮一轮又一轮
// [00:07.00]不能理顺
// [00:08.00]自己的疑问
// [00:09.00]屏幕前传来
// [00:13.00]我微弱的键盘声
// [00:21.00]没有啥话语权
// [00:22.00]也无法忍受白干
// [00:24.00]压垮人的从来不是爆肝
// [00:26.00]而是期待
// [00:27.00]遏制住我发疯
// [00:28.00]也没让钱包痛快
// [00:29.00]哦我茅塞顿开
// [00:30.00]原来是承诺在作怪
// [00:32.00]漏了一拍
// [00:33.00]我只能每天用代码把自己搞得很晕
// [00:36.00]坏事降临头上也不清醒
// [00:38.00]可笼罩在我头顶上的“隆盛”
// [00:40.00]紧跟着我逃不出他手心
// [00:43.00]我的愁绪
// [00:44.00]Git的记录挥之不去
// [00:46.00]闭上眼聊天记录里下了场雨
// [00:49.00]坠入梦乡也想着PRD
// [00:55.00]项目把我拽回二月光
// [00:58.00]摇摇晃晃到科研乡
// [01:00.00]论文漫过电脑屏幕
// [01:03.00]脚印伴随着微光
// [01:06.00]“这活，有钱有量”
// [01:08.00]他讲 “你在说谎”
// [01:11.00]都是画的大饼空想
// [01:13.00]你眼里带着泪光
// [01:16.00]我诉愁肠向科研乡
// [01:19.00]把叹息吹成代码行
// [01:22.00]明明快崩溃了
// [01:24.00]却还要乔装无关痛痒
// [01:27.00]展会的人潮熙熙攘攘
// [01:30.00]往我手心上放个奖
// [01:33.00]“表现不错，公司都看在眼里”
// [01:39.00]放声大骂吧
// [01:40.00]这里没人会同情你
// [01:42.00]项目大事莫过KPI
// [01:44.00]其他都不要紧
// [01:45.00]现实太要命了
// [01:46.00]让我时刻想要逃离
// [01:48.00]可是转眼间被Deadline叫醒
// [01:50.00]累了就看眼股价涨涨
// [01:52.00]放心吧 那是他兜里够花够花
// [01:55.00]我骗家人是研学
// [01:57.00]我实际是牛马
// [01:58.00]没日没夜没有休假
// [02:01.00]江大在那边缺啥少啥
// [02:04.00]有事没事都发个电话
// [02:06.00]“兄弟你们到底啥时候给钱啊”
// [02:09.00]隆盛那边的石榴还没开花
// [02:14.00]几度梦回科研乡
// [02:16.00]回回梦的都不重样
// [02:19.00]企划书掠过会议室后
// [02:22.00]铁了心的要变样
// [02:25.00]哪管初心几多长
// [02:27.00]偏信画饼是朝阳
// [02:30.00]却输合同半张纸
// [02:32.00]人走茶凉
// [02:36.00]几度梦回科研乡
// [02:38.00]旧代码飘向发布会场
// [02:41.00]载着未发出的薪水
// [02:44.00]还有PPT染上的香
// [02:47.00]摇...摇摇晃晃
// [02:50.00]飘...飘飘荡荡
// [02:52.00]“项目抬头望，价值在天上”
//     `

//     if (id === 'pay-for-me') {
//       return {
//         id: 'pay-for-me',
//         meta: {
//           url: 'https://public-9e72.obs.cn-north-4.myhuaweicloud.com/dream.wav',
//           md5: '66c1bcfa3bd9934bf7a28668aec6c01f',
//           // 37.71 MB
//           size: 39546696,
//           bitrate: 320000,
//           isFavorite: false,
//           lyric: {
//             normal: pay_for_me,
//             translation: '',
//             transliteration: ''
//           }
//         }
//       }
//     }

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
