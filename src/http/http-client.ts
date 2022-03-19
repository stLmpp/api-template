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

const contentTypeToResponseType: [string[], ResponseType][] = [
  [['application/json'], 'json'],
  [['text/html', 'text/plain', 'text/xml'], 'text'],
];

@Injectable()
export class HttpClient {
  constructor(private readonly validationService: ValidationService, private readonly loggerFactory: LoggerFactory) {}

  private readonly _logger = this.loggerFactory.create('HttpClient');

  private _normalizeContentType(contentType: string): ResponseType {
    for (const [possibleContentTypes, responseType] of contentTypeToResponseType) {
      if (possibleContentTypes.some(possibleContentType => contentType.includes(possibleContentType))) {
        return responseType;
      }
    }
    return 'text';
  }

  private async _handleError(response: Response): Promise<HttpError> {
    const contentType = response.headers.get('Content-Type');
    let error: string | Record<string, unknown> | undefined;
    if (contentType) {
      const responseType = this._normalizeContentType(contentType);
      error = await response[responseType]();
    }
    this._logger.error('Error response', error);
    return new HttpError({ statusCode: response.status, message: response.statusText, error });
  }

  private async _base<T>(options: RequestOptions<T>): Promise<HttpResponse<T>> {
    this._logger.info('RequestOptions', options);
    const requestInit: RequestInit = {
      method: options.method,
      body: options.body ?? null,
      headers: options.headers ?? { 'Content-Type': 'application/json' },
    };
    const response = await fetch(options.url, requestInit);
    if (!response.ok) {
      throw await this._handleError(response);
    }
    const responseType = options.responseType ?? 'json';
    let data: T = await response[responseType]();
    if (responseType === 'json' && options.validate) {
      const [instance, errors] = await this.validationService.validate<T>(options.validate, data);
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
      data = instance;
    }
    this._logger.info('Response data', data);
    return new HttpResponse({ data, statusCode: response.status });
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
