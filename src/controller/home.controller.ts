import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return {
      name: 'omsp-2026-0305',
      version: '1.0.0'
    }
  }
}
