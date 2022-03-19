import { HttpMethod } from '../../http/http-method.enum';
import { createRouteDecorator } from '../factory/create-route-decorator';

export const Delete = createRouteDecorator(HttpMethod.DELETE);
