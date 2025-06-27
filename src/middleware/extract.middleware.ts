import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

function isString(value: any): value is string {
  return typeof value === 'string';
}

@Middleware()
export class ExtractMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 判断方法
      const method = ctx.method;
      ctx.base_parms = {
        timestamp: Date.now(),
      };
      // 从请求头获取token
      let token = ctx.request.headers['token'] || ctx.request.headers['Token'];
      if (isString(token)) {
        // 是否Bearer token
        if (token.startsWith('Bearer ')) {
          token = token.replace('Bearer ', '');
        }
        ctx.base_parms.cookie = token;
      } else {
        // 游客登录
        ctx.base_parms.cookie = '';
      }
      if (method.toUpperCase() === 'GET') {
        // 获取 query 参数
        const { realIP = undefined, proxy = undefined } = ctx.request.query;
        if (isString(realIP) && isString(proxy)) {
          ctx.base_parms.realIP = realIP;
          ctx.base_parms.proxy = proxy;
        }
      } else if (method.toUpperCase() === 'POST') {
        // 获取 body 参数
        const { realIP = undefined, proxy = undefined } = ctx.request.body as any;
        if (isString(realIP) && isString(proxy)) {
          ctx.base_parms.realIP = realIP;
          ctx.base_parms.proxy = proxy;
        }
      }

      // Cookie 加上os=pc
      ctx.base_parms.cookie = `${ctx.base_parms.cookie}; os=pc`;
      await next();
    };
  }

  static getName(): string {
    return 'ExtractMiddleware';
  }
}
