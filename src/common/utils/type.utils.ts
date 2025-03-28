/**
 * 根据类型定义过滤对象字段
 * @param sourceObj 源对象
 * @param type 类型定义（作为类型参数传入）
 * @returns 过滤后的对象
 */
export function filterObjectByType<T extends object>(sourceObj: object): T {
  const result = {} as T;

  Object.keys(sourceObj).forEach((key) => {
    if (key in sourceObj && typeof key === 'string') {
      (result as any)[key] = sourceObj[key as keyof typeof sourceObj];
    }
  });

  return result;
}
