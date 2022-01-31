import { createRouteDecorator } from '../factory/create-route-decorator';
import { HTTPMethod } from '../../enum/http-method.enum';

export const Get = createRouteDecorator(HTTPMethod.GET);
