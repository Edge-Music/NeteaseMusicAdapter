import { ErrorCode } from "../constants/error-code.constant";

export class BusinessException extends Error {
  code: number;
  data?: any;

  constructor(message: string, code: number = ErrorCode.SYSTEM_ERROR, data?: any) {
    super(message);
    this.code = code;
    this.data = data;
  }
}
