import { Injectable } from '../injector/injectable.decorator';
import { HttpMethod } from './http-method.enum';
import { HttpError } from './http-error';
import { Class } from 'type-fest';
import { StatusCodes } from 'http-status-codes';
import { HttpResponse } from './http-response';
import { ValidationService } from '../validation/validation.service';
import { LoggerFactory } from '../logger/logger.factory';

export type ResponseType = 'json' | 'arrayBuffer' | 'text';

export interface RequestOptions<T extends Record<any, any>> {
  method: HttpMethod;
  url: string;
  responseType?: ResponseType;
  body?: BodyInit;
  headers?: HeadersInit;
  validate?: Class<T>;
}

@Injectable()
export class HttpClient {
  constructor(private readonly validationService: ValidationService, private readonly loggerFactory: LoggerFactory) {}

  private readonly _logger = this.loggerFactory.create('HttpClient');

  private async _base<T>(options: RequestOptions<T>): Promise<HttpResponse<T>> {
    this._logger.info('RequestOptions', options);
    const requestInit: RequestInit = {
      method: options.method,
      body: options.body ?? null,
      headers: options.headers ?? { 'Content-Type': 'application/json' },
    };
    const response = await fetch(options.url, requestInit);
    if (!response.ok) {
      this._logger.error('Response', response);
      throw new HttpError({ statusCode: response.status, message: response.statusText });
    }
    const responseType = options.responseType ?? 'json';
    const responseData = await response[responseType]();
    let responseDataTyped: T = responseData;
    if (responseType === 'json' && options.validate) {
      const [instance, errors] = await this.validationService.validate(options.validate, responseData);
      if (errors.length) {
        this._logger.error('Errors', errors);
        throw new HttpError({
          statusCode: StatusCodes.SERVICE_UNAVAILABLE,
          message: 'Error while validating response from provider',
          errors: errors.map(error => error.message),
          metadata: {
            validation: {
              errors,
              type: options.validate.name,
            },
          },
        });
      }
      responseDataTyped = instance;
    }
    return new HttpResponse({ data: responseDataTyped, statusCode: response.status });
  }

  get<T>(url: string, options?: Omit<RequestOptions<T>, 'method' | 'url' | 'body'>): Promise<HttpResponse<T>> {
    return this._base({ ...options, url, method: HttpMethod.GET });
  }

  delete<T>(url: string, options?: Omit<RequestOptions<T>, 'method' | 'url'>): Promise<HttpResponse<T>> {
    return this._base({ ...options, url, method: HttpMethod.DELETE });
  }

  patch<T>(url: string, options?: Omit<RequestOptions<T>, 'method' | 'url'>): Promise<HttpResponse<T>> {
    return this._base({ ...options, url, method: HttpMethod.PATCH });
  }

  post<T>(url: string, options?: Omit<RequestOptions<T>, 'method' | 'url'>): Promise<HttpResponse<T>> {
    return this._base({ ...options, url, method: HttpMethod.POST });
  }

  put<T>(url: string, options?: Omit<RequestOptions<T>, 'method' | 'url'>): Promise<HttpResponse<T>> {
    return this._base({ ...options, url, method: HttpMethod.PUT });
  }
}
