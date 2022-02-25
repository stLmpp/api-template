import { Injectable } from '../injector/injectable.decorator';
import { HttpMethod } from './http-method.enum';
import { HttpError } from './http-error';
import { Class } from 'type-fest';
import { StatusCodes } from 'http-status-codes';
import { HttpResponse } from './http-response';
import { ValidationService } from '../validation/validation.service';

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
  constructor(private validationService: ValidationService) {}

  private async _base<T>(options: RequestOptions<T>): Promise<HttpResponse<T>> {
    const requestInit: RequestInit = {
      method: options.method,
      body: options.body ?? null,
      headers: options.headers ?? { 'Content-Type': 'application/json' },
    };
    const response = await fetch(options.url, requestInit);
    if (!response.ok) {
      throw new HttpError({ statusCode: response.status, message: response.statusText });
    }
    const responseType = options.responseType ?? 'json';
    const responseData = await response[responseType]();
    let responseDataTyped: T = responseData;
    if (responseType === 'json' && options.validate) {
      const [instance, errors] = await this.validationService.validate(options.validate, responseData);
      if (errors.length) {
        throw new HttpError({
          statusCode: StatusCodes.SERVICE_UNAVAILABLE,
          message: 'Error while validating response from provider',
          // TODO add errors property after ApplicationError refactor
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
