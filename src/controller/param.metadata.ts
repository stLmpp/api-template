import { Request } from 'express';
import { noop } from 'st-utils';

export type ParameterType = 'params' | 'query' | 'body' | 'headers';

export class ParamMetadata {
  parser: (req: Request) => any = noop;
  type: any | undefined | null;
  parameterType!: ParameterType;
  name?: string;
}
