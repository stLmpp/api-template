import { HttpMethod } from '../../http/http-method.enum';
import { createRouteDecorator } from '../factory/create-route-decorator';

export const Get = createRouteDecorator(HttpMethod.GET);
