export const ErrorCode = {
  // 系统级别错误码
  SYSTEM_OK: 0,
  SYSTEM_ERROR: -1,
  PARAMS_ERROR: 40000,
  UNAUTHORIZED: 40100,
  FORBIDDEN: 40300,
  NOT_FOUND: 40400,
  TOO_MANY_REQUESTS: 42900,
} as const;
