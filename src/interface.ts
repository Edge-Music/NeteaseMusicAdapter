import '@midwayjs/core';
import { RequestBaseConfig } from 'NeteaseCloudMusicApi'
declare module '@midwayjs/core' {
  interface Context {
    base_parms: RequestBaseConfig & { timestamp?: number };
  }
}

