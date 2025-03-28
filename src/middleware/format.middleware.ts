import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { ErrorCode } from '../common/constants/error-code.constant';

/**
 * 对接口返回的数据统一包装
 */
@Middleware()
export class FormatMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const result = await next();
      return { code: ErrorCode.SYSTEM_OK, message: 'success', data: result, timestamp: Date.now() };
    };
  }

  static getName(): string {
    return 'FormatMiddleware';
  }
}

