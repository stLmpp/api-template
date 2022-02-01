import { Request } from 'express';
import { noop } from 'st-utils';

export class ParamMetadata {
  parser: (req: Request) => any = noop;
  type: any | undefined | null;
}
