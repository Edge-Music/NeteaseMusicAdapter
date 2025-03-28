export class ResponseUtil {
  static success<T>(data: T, message = 'Success') {
    return {
      code: 0,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message: string, code = -1, data: any = null) {
    return {
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }
}
