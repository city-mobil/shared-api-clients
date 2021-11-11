import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios'

export interface BaseHTTPClientParams {
  baseURL: string
  timeout?: number
}

export type BaseHTTPClientRequestParams = Record<string, any>
export type BaseHTTPClientRequestHeaders = Record<string, string>

export type BaseHTTPClientConfigOverride = AxiosRequestConfig
export type BaseHTTPClientResponse<T = unknown> = AxiosResponse<T>
export type BaseHTTPClientError<E = unknown> = AxiosError<E>

export interface BaseHTTPClientRequestConfig {
  path?: string
  method?: Method
  params?: BaseHTTPClientRequestParams
  headers?: BaseHTTPClientRequestHeaders
  override?: BaseHTTPClientConfigOverride
}

export class BaseHTTPClient {
  protected api: AxiosInstance
  protected baseURL: string
  protected timeout: number

  constructor(params: BaseHTTPClientParams) {
    const { baseURL, timeout = 30000 } = params

    this.api = axios.create()

    this.baseURL = baseURL
    this.timeout = timeout
  }

  // Тип ошибки нам пригодится, хоть мы тут его и не используем
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public request<T = unknown, _E = unknown>(config: BaseHTTPClientRequestConfig): Promise<BaseHTTPClientResponse<T>> {
    const { method = 'get', path = '', params = {}, headers = {}, override } = config

    const url = `${this.baseURL}${path}`
    const normalizedMethod = method.toLowerCase()

    let requestConfig: AxiosRequestConfig = {
      url,
      method,
      headers: {
        ...headers,
      },
      timeout: this.timeout,
    }

    if (normalizedMethod.toLowerCase() === 'post') {
      requestConfig.data = params
    } else {
      requestConfig.params = params
    }

    if (override) {
      requestConfig = {
        ...requestConfig,
        ...override,
      }
    }

    return this.api.request<T>(requestConfig)
  }

  public setBaseURL = (url: BaseHTTPClient['baseURL']): void => {
    this.baseURL = url
  }

  public setTimeout = (timeout: BaseHTTPClient['timeout']): void => {
    this.timeout = timeout
  }
}
