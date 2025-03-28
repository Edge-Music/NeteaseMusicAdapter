import { Inject, Controller, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { login_qr_create, login_qr_key, login_qr_check, login_status } from 'NeteaseCloudMusicApi'
import { BusinessException } from '../common/exceptions/business.exception';
import { filterObjectByType } from '../common/utils/type.utils';

@Controller('/connect')
export class APIController {
  @Inject()
  ctx: Context;

  @Get('/qr/key')
  async qrKey() {
    const result = await login_qr_key(this.ctx.base_parms);
    return {
      unikey: (result.body.data as any).unikey
    }
  }

  @Get('/qr/create')
  async qrCreate(@Query('key') key: number | string, @Query('qrimg') qrimg: boolean | string = true): Promise<QrCreateResponse> {
    const result = await login_qr_create({
      key,
      qrimg,
      ...this.ctx.base_parms,
    });
    const data = (result.body.data as any);
    return {
      qrurl: data.qrurl,
      qrimg: data.qrimg
    }
  }

  @Get('/qr/check')
  async qrCheck(@Query('key') key: number | string): Promise<QrCheckResponse> {
    const result = await login_qr_check({
      key,
      ...this.ctx.base_parms,
    });
    const code = result.body.code;
    const cookie = result.body.cookie;
    return {
      status: code - 801, // -1 过期，0 等待扫码，1 等待确认，2 授权登录成功，等待验证
      cookie
    }
  }

  @Get('/status')
  async status(): Promise<StatusResponse> {
    const base_parms = this.ctx.base_parms;
    // 检查是否有 cookie
    if (!base_parms.cookie) {
      throw new BusinessException('请先登录');
    }
    const result = await login_status({
      ...base_parms,
    });
    const data = (result.body.data) as any;
    const profile = filterObjectByType<AccountProfile>(data.profile);
    return {
      id: profile.userId,
      name: profile.nickname,
      avatar: profile.avatarUrl,
    }
  }
}
