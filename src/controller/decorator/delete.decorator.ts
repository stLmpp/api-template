import { createRouteDecorator } from '../factory/create-route-decorator';
import { HTTPMethod } from '../../enum/http-method.enum';

export const Delete = createRouteDecorator(HTTPMethod.DELETE);
