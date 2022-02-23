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
import { i18nService } from './i18n/i18n.service';
import { I18nKey } from './i18n/i18n-key.enum';
import { Injectable } from './injector/injectable.decorator';
import { StatusCodes } from 'http-status-codes';
import { HttpClient } from './http/http-client';
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  validate,
  ValidateNested,
  ValidationError,
} from 'class-validator';
import { plainToClass, Transform, Type } from 'class-transformer';

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
  @Transform(({ value }) => Number(value))
  ddd!: number;

  @IsDefined()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  siafi!: number;
}

@Injectable()
export class HelloService {
  constructor(private httpClient: HttpClient) {}

  async get(data: Model): Promise<Model> {
    const model = new Model();
    const cepResponse = await this.httpClient.get<CepModel>('https://viacep.com.br/ws/01001000/json/', {
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
  constructor(private readonly helloService: HelloService) {
    super();
  }

  override async execute({ id, teste }: Model): Promise<Result<Model>> {
    const data = await this.helloService.get({ teste, id });
    return new Result(data).setMeta({
      message1: i18nService.get(I18nKey.internalError),
      message2: i18nService.get(I18nKey.errorWithParam, { error: 'custom' }),
      message3: i18nService.get(I18nKey.otherError),
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
  // console.log({
  //   INTERNAL_ERROR: i18nService.get('INTERNAL_ERROR'),
  //   ERROR_WITH_PARAM: i18nService.get('ERROR_WITH_PARAM', { error: 'custom errors, Idk' }),
  // });
  console.log(entries);

  const user = {
    books: [
      { id: '1', name: 'Book 1', te: 1 },
      { id: 2, name: 'Book 2' },
      { id: 3, name: 'Book 3' },
    ],
    id: '1',
    settings: { dateFormat: 1 },
  };

  const userInstance = plainToClass(User, user);
  const errors = await validate(userInstance, {
    forbidUnknownValues: true,
    enableDebugMessages: true,
    whitelist: true,
  });
  console.log('user', userInstance);
  console.log('errors', errors);
  console.log('formatted', formatMessagesRecursive(errors));
}

main().then().catch(console.error);

interface ValidationErrorAlt {
  property: string;
  message: string;
}

function formatMessageRecursive(message: ValidationError, parent?: string): ValidationErrorAlt[] {
  const property = parent ? `${parent}.${message.property}` : message.property;
  const messages: ValidationErrorAlt[] = [];
  if (message.constraints) {
    const values: ValidationErrorAlt[] = Object.values(message.constraints).map(error => ({
      message: error.replace(message.property, property),
      property,
    }));
    messages.push(...values);
  }
  if (message.children?.length) {
    messages.push(...formatMessagesRecursive(message.children, property));
  }
  return messages;
}

function formatMessagesRecursive(messages: ValidationError[], parent?: string): ValidationErrorAlt[] {
  return messages.reduce(
    (acc, message) => [...acc, ...formatMessageRecursive(message, parent)],
    [] as ValidationErrorAlt[]
  );
}

class Book {
  @IsDefined()
  @IsNumber()
  id!: number;

  @IsDefined()
  @IsString()
  @MaxLength(250)
  @IsNotEmpty()
  name!: string;
}

class Settings {
  @IsDefined()
  @IsString()
  dateFormat!: string;
}

class User {
  @IsDefined()
  @IsNumber()
  id!: number;

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Book)
  books!: Book[];

  @IsDefined()
  @ValidateNested()
  @Type(() => Settings)
  settings!: Settings;
}
