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
import { Property } from './schema-metadata/property.decorator';
import { controllerMetadataStore } from './controller/controller.metadata';
import { generateI18n } from './i18n/generate-i18n';
import { i18nService } from './i18n/i18n.service';

export class Model {
  @Property() id!: number;
  @Property({ type: 'object' }) teste!: object;
}

@Env()
export class Environment extends BaseEnvironment {
  @EnvProp() timeout!: number;
  @EnvProp() flag!: boolean;
  @EnvProp({ converter: (value: string) => value.split(',').map(Number) }) array!: number[];
  @EnvProp({ converter: JSON.parse }) metadata!: Record<string, string>;
}

@UseCase()
export class HelloUseCase extends BaseUseCase<Model, Model> {
  override execute({ id, teste }: Model): Result<Model> {
    return new Result({ id, teste });
  }
}

@Controller('/')
export class AppController {
  constructor(private helloUseCase: HelloUseCase) {}

  @Get('/:id')
  async get(@Param('id') id: number, @Query('teste') teste: any): Promise<Result<Model>> {
    return this.helloUseCase.execute({ id, teste });
  }
}

const app = ApiFactory.create({ port: 3000, controllers: [AppController] });

async function main(): Promise<void> {
  await app.listen();
  const entries = controllerMetadataStore.entries();
  await generateI18n();
  console.log({
    INTERNAL_ERROR: i18nService.get('INTERNAL_ERROR'),
    ERROR_WITH_PARAM: i18nService.get('ERROR_WITH_PARAM', { error: 'custom errors, Idk' }),
  });
  console.log(entries);
}

main().then();
