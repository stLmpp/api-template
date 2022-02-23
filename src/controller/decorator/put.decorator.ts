import { createRouteDecorator } from '../factory/create-route-decorator';
import { HttpMethod } from '../../http/http-method.enum';

export const Put = createRouteDecorator(HttpMethod.PUT);
