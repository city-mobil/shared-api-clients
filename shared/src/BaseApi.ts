import {
  BaseHTTPClient,
  BaseHTTPClientError,
  BaseHTTPClientParams,
  BaseHTTPClientRequestConfig,
  BaseHTTPClientRequestHeaders,
  BaseHTTPClientRequestParams,
  BaseHTTPClientResponse,
} from './BaseHTTPClient'

export interface BaseApiParams {
  defaultParams?: BaseApi['defaultParams']
  defaultHeaders?: BaseApi['defaultHeaders']
  extraHeaders?: BaseApi['extraHeaders']
  httpParams: BaseHTTPClientParams
}

export type BaseApiDefaultParams = BaseHTTPClientRequestParams
export type BaseApiDefaultHeaders = BaseHTTPClientRequestHeaders
export type BaseApiExtraHeaders = BaseHTTPClientRequestHeaders
export type BaseApiResponseHandler<T = unknown> = (response: BaseHTTPClientResponse<T>) => T
export type BaseApiErrorHandler<E = unknown> = (error: BaseHTTPClientError<E>) => never
export type UnauthorizedCallbackFn = (error?: BaseHTTPClientError) => void

export interface BaseApiRequestConfig extends BaseHTTPClientRequestConfig {
  headersList: string[]
}

export class BaseApi {
  protected api: BaseHTTPClient
  protected defaultParams: BaseApiDefaultParams
  protected defaultHeaders: BaseApiDefaultHeaders
  protected extraHeaders: BaseApiExtraHeaders
  protected responseHandler: BaseApiResponseHandler | null
  protected errorHandler: BaseApiErrorHandler | null
  protected unauthorizedCallback: UnauthorizedCallbackFn | null

  constructor(params: BaseApiParams) {
    const { httpParams, defaultParams = {}, defaultHeaders = {}, extraHeaders = {} } = params

    this.api = new BaseHTTPClient(httpParams)

    this.defaultParams = defaultParams
    this.defaultHeaders = defaultHeaders
    this.extraHeaders = extraHeaders
    this.responseHandler = null
    this.errorHandler = null
    this.unauthorizedCallback = null
  }

  get config() {
    return {
      http: {
        setBaseURL: this.api.setBaseURL,
        setTimeout: this.api.setTimeout,
      },
      params: {
        clear: this.clearDefaultParams,
        setParam: this.setDefaultParam,
      },
      headers: {
        clear: this.clearDefaultHeaders,
        setDefaultHeader: this.setDefaultHeader,
        setExtraHeader: this.setExtraHeader,
      },
      handlers: {
        setResponseHandler: this.setResponseHandler,
        setErrorHandler: this.setErrorHandler,
        setUnauthorizedCallback: this.setUnauthorizedCallback,
      },
    }
  }

  public request = <T = unknown, E = unknown>(config: BaseApiRequestConfig): Promise<T> => {
    const requestConfig: BaseHTTPClientRequestConfig = {
      ...config,
    }

    requestConfig.params = {
      ...this.defaultParams,
      ...requestConfig.params,
    }

    // Добавляем заголовки по-умолчанию - они не меняются на протяжении всей сессии
    requestConfig.headers = {
      ...this.defaultHeaders,
    }

    // И добавляем к конкретному запросу нужные ему заголовки
    if (Array.isArray(config.headersList)) {
      for (let i = 0; i < config.headersList.length; i++) {
        const key = config.headersList[i]
        const value = this.extraHeaders[key]

        if (value) {
          requestConfig.headers[key] = value
        }
      }
    }

    // И докидываем те, которые явно проброшены в качестве параметра
    requestConfig.headers = {
      ...requestConfig.headers,
      ...config.headers,
    }

    const responseHandler = this.responseHandler || this.defaultResponseHandler
    const errorHandler = this.errorHandler || this.defaultErrorHandler

    return this.api
      .request<T, E>(requestConfig)
      .then((response) => responseHandler(response) as T)
      .catch(errorHandler)
  }

  protected clearDefaultParams = () => {
    this.defaultParams = {}

    return this.config
  }

  protected setDefaultParam = (key: string, param?: unknown) => {
    if (param === undefined) {
      delete this.defaultParams[key]

      return this.config
    }

    this.defaultParams[key] = param

    return this.config
  }

  protected clearDefaultHeaders = () => {
    this.defaultHeaders = {}

    return this.config
  }

  protected setDefaultHeader = (key: string, param?: string) => {
    if (param === undefined) {
      delete this.defaultHeaders[key]

      return this.config
    }

    this.defaultHeaders[key] = param

    return this.config
  }

  protected setExtraHeader = (key: string, param?: string) => {
    if (param === undefined) {
      delete this.extraHeaders[key]

      return this.config
    }

    this.extraHeaders[key] = param

    return this.config
  }

  protected setResponseHandler = (handler: BaseApiResponseHandler | null) => {
    this.responseHandler = handler

    return this.config
  }

  protected setErrorHandler = (handler: BaseApiErrorHandler | null) => {
    this.errorHandler = handler

    return this.config
  }

  protected setUnauthorizedCallback = (callback: UnauthorizedCallbackFn | null) => {
    this.unauthorizedCallback = callback

    return this.config
  }

  protected defaultResponseHandler = <T = unknown>(response: BaseHTTPClientResponse<T>) => response.data

  protected defaultErrorHandler: BaseApiErrorHandler = (error) => {
    throw error
  }
}
