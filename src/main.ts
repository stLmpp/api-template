import { ApiFactory } from './api/api-factory';
import { Result } from './result/result';
import { BaseUseCase } from './use-case/base-use-case';
import { UseCase } from './use-case/use-case.decorator';
import { Query } from './controller/decorator/query.decorator';
import { Get } from './controller/decorator/get.decorator';
import { Param } from './controller/decorator/param.decorator';
import { Controller } from './controller/decorator/controller.decorator';
import { BaseEnvironment } from './environment/base-environment';
import { EnvProp } from './environment/env-prop.decorator';
import { Env } from './environment/env.decorator';
import { Logger } from './logger/logger';

@Env()
export class Environment extends BaseEnvironment {
  @EnvProp() timeout!: number;
  @EnvProp() flag!: boolean;
  @EnvProp({ converter: (value: string) => value.split(',').map(Number) }) array!: number[];
  @EnvProp({ converter: JSON.parse }) metadata!: Record<string, string>;
}

@UseCase()
export class HelloUseCase extends BaseUseCase<any, { id: number; teste: any }> {
  constructor(private environment: Environment) {
    super();
  }

  override execute({ id, teste }: { id: number; teste: any }): Result<any> {
    return new Result({ id, teste, environment: { ...this.environment } });
  }
}

@Controller('/')
export class AppController {
  constructor(private helloUseCase: HelloUseCase) {}

  logger = Logger.create('Controller');

  @Get('/:id')
  async get(@Param('id') id: number, @Query('teste') teste: any): Promise<Result<any>> {
    this.logger.error('teste');
    return this.helloUseCase.execute({ id, teste });
  }
}

const app = ApiFactory.create({ port: 3000 });

async function main(): Promise<void> {
  await app.bootstrap().catch(console.error);

  const logger = Logger.create('Teste');

  logger.info('Some info here');
  logger.error('Some error here');
}

main().then();
