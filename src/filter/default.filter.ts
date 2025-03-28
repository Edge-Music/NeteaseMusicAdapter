import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { BusinessException } from '../common/exceptions/business.exception';
import { ResponseUtil } from '../common/utils/response.util';
import { ErrorCode } from '../common/constants/error-code.constant';
import { MidwayValidationError } from '@midwayjs/validate';

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    // 已知业务异常
    if (err instanceof BusinessException) {
      return ResponseUtil.error(err.message, err.code, err.data);
    }

    // 参数验证异常
    if (err instanceof MidwayValidationError) {
      return ResponseUtil.error(
        '参数验证失败: ' + err.message,
        ErrorCode.PARAMS_ERROR,
      );
    }

    // 未知异常
    console.error(err);
    return ResponseUtil.error(
      '服务器内部错误',
      ErrorCode.SYSTEM_ERROR,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    );
  }
}
