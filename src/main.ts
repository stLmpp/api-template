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
import { I18nKey } from './i18n/i18n-key.enum';
import { Injectable } from './injector/injectable.decorator';
import { StatusCodes } from 'http-status-codes';
import { HttpClient } from './http/http-client';
import { IsDefined, IsNumber, IsString } from 'class-validator';
import { I18nService } from './i18n/i18n.service';

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
  constructor(private httpClient: HttpClient) {}

  async get(data: Model): Promise<Model> {
    const model = new Model();
    const cepResponse = await this.httpClient.get<CepModel>('https://viacep.com.br/ws/010010001/json', {
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

@Controller('/')
export class AppController {
  constructor(private helloUseCase: HelloUseCase) {}

  @Get({ path: '/:id', httpCode: StatusCodes.ACCEPTED })
  async get(@Param('id') id: number, @Query('teste') teste: any): Promise<Result<Model>> {
    return this.helloUseCase.execute({ id, teste });
  }
}

async function main(): Promise<void> {
  const app = await ApiFactory.create({ port: 3000, controllers: [AppController] });
  await app.listen();
  const entries = controllerMetadataStore.entries();
  console.log(entries);
}

main().then().catch(console.error);
