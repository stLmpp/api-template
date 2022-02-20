import { Result } from '../result/result';

export abstract class BaseUseCase<T, P = void> {
  abstract execute(params: P): Result<T> | Promise<Result<T>>;
}
