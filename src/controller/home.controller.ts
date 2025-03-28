import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return {
      name: 'universal-music-api-for-seamusic',
      version: '1.0.0',
      web: {
        url: 'https://music.163.com/#/login',
        domain: 'https://music.163.com'
      }
    }
  }
}
