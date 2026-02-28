import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return {
      name: 'omsp-n1',
      version: '1.0.0'
    }
  }
}
