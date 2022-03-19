import { ParsedQs } from 'qs';
import { isFunction } from 'st-utils';

export function parseParam(params: Record<string, string> | ParsedQs, param?: string, type?: (arg: any) => any): any {
  if (param) {
    let paramValue = params[param];
    if (isFunction(type)) {
      paramValue = type(paramValue);
    }
    return paramValue;
  }
  return params;
}
