import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return {
      name: 'universal-music-api-for-seamusic',
      version: '1.0.0'
    }
  }
}
