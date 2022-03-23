import { IsDefined, IsNumber, IsString } from 'class-validator';
import { StatusCodes } from 'http-status-codes';

import { ApiFactory } from './api/api-factory';
import { controllerMetadataStore } from './controller/controller.metadata';
import { Body } from './controller/decorator/body.decorator';
import { Controller } from './controller/decorator/controller.decorator';
import { Get } from './controller/decorator/get.decorator';
import { Header } from './controller/decorator/header.decorator';
import { Param } from './controller/decorator/param.decorator';
import { Post } from './controller/decorator/post.decorator';
import { Query } from './controller/decorator/query.decorator';
import { BaseEnvironment } from './environment/base-environment';
import { EnvProp } from './environment/env-prop.decorator';
import { Env } from './environment/env.decorator';
import { HttpClient } from './http/http-client';
import { I18nKey } from './i18n/i18n-key.enum';
import { I18nService } from './i18n/i18n.service';
import { Injectable } from './injector/injectable.decorator';
import { getOpenapiSchema } from './openapi/get-openapi-schema';
import { Result } from './result/result';
import { Property } from './schema-metadata/property.decorator';
import { BaseUseCase } from './use-case/base-use-case';
import { UseCase } from './use-case/use-case.decorator';

export class Model {
  @Property() id!: number;
  @Property({ type: 'object' }) teste!: object;
}

@Env()
export class Environment extends BaseEnvironment {
  @EnvProp() timeout!: number;
  @EnvProp() flag!: boolean;
  @EnvProp({ parser: (value: string) => value.split(',').map(Number) }) array!: number[];
  @EnvProp({ parser: JSON.parse }) metadata!: Record<string, string>;
}

class CepModel {
  @IsDefined()
  @IsString()
  cep!: string;

  @IsDefined()
  @IsString()
  logradouro!: string;

  @IsDefined()
  @IsString()
  complemento!: string;

  @IsDefined()
  @IsString()
  bairro!: string;

  @IsDefined()
  @IsString()
  localidade!: string;

  @IsDefined()
  @IsString()
  uf!: string;

  @IsDefined()
  @IsString()
  ibge!: string;

  @IsDefined()
  @IsString()
  gia!: string;

  @IsDefined()
  @IsNumber()
  ddd!: number;

  @IsDefined()
  @IsNumber()
  siafi!: number;
}

@Injectable()
export class HelloService {
  constructor(private httpClient: HttpClient, private environment: Environment) {}

  async get(data: Model): Promise<Model> {
    const model = new Model();
    const cepResponse = await this.httpClient.get('https://viacep.com.br/ws/010010001/json', {
      validate: CepModel,
    });
    model.id = data.id;
    model.teste = {
      ...data.teste,
      cep: cepResponse.data,
    };
    return model;
  }
}

@UseCase()
export class HelloUseCase extends BaseUseCase<Model, Model> {
  constructor(private readonly helloService: HelloService, private readonly i18nService: I18nService) {
    super();
  }

  override async execute({ id, teste }: Model): Promise<Result<Model>> {
    const data = await this.helloService.get({ teste, id });
    return new Result(data).setMeta({
      message1: this.i18nService.get(I18nKey.internalError),
      message2: this.i18nService.get(I18nKey.errorWithParam, { error: 'custom' }),
      message3: this.i18nService.get(I18nKey.otherError),
    });
  }
}

@Controller()
export class AppController {
  constructor(private helloUseCase: HelloUseCase) {}

  @Get({ path: ':id', httpCode: StatusCodes.ACCEPTED, responseType: Model })
  async get(@Param('id') id: number, @Query('teste') teste: any): Promise<Result<Model>> {
    return this.helloUseCase.execute({ id, teste });
  }

  @Post({ path: ':id', httpCode: StatusCodes.CREATED, responseType: Model })
  async post(@Param('id') id: number, @Body() body: Model, @Header() header: any): Promise<Result<Model>> {
    return this.helloUseCase.execute({ id, teste: { body, header } });
  }
}

async function main(): Promise<void> {
  const app = await ApiFactory.create({ controllers: [AppController] });
  await app.listen();
  const entries = controllerMetadataStore.entries();
  app.getDefaultLogger().info('Info', entries[0][1].routes);
  console.log(getOpenapiSchema(Model));
  console.log(getOpenapiSchema(CepModel));
  console.log(getOpenapiSchema(Number));
}

main().then();
