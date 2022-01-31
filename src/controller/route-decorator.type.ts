export interface RouteDecoratorType {
  (path?: string): MethodDecorator;
}
