import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import qs from 'qs';

export default class WrappedAxiosFetcher<T> {
  baseUrl: string;
  onGetIdTokenAsync?: () => Promise<string>;

  constructor(endpoint: string, onGetIdTokenAsync?: () => Promise<string>) {
    this.baseUrl = endpoint;
    this.onGetIdTokenAsync = onGetIdTokenAsync;
  }

  post = async (model: T, route?: string) => {
    const defaultConfig = await this._getDefaultConfig();
    return axios.post(route || '', model, defaultConfig);
  };

  patch = async (patch: any, route?: string) => {
    const defaultConfig = await this._getDefaultConfig();
    return axios
      .patch(route || '', patch, defaultConfig)
      .then((response: AxiosResponse) => response.data);
  };

  getMany = async (route?: string, queryParams?: any): Promise<T[]> => {
    const defaultConfig = await this._getDefaultConfig();
    defaultConfig.params = queryParams;

    return axios
      .get(route || '', defaultConfig)
      .then((response: AxiosResponse) => response.data);
  };

  get = async (
    route?: string,
    queryParams?: any,
    otherConfig?: AxiosRequestConfig,
  ): Promise<T> => {
    const defaultConfig = await this._getDefaultConfig(otherConfig);
    defaultConfig.params = queryParams;

    return axios
      .get(route || '', defaultConfig)
      .then((response: AxiosResponse) => response.data);
  };

  private _getDefaultConfig = async (
    otherConfig?: AxiosRequestConfig,
  ): Promise<AxiosRequestConfig> => {
    const result: AxiosRequestConfig = {
      baseURL: this.baseUrl,
      paramsSerializer: params => {
        return qs.stringify(params);
      },
      ...(otherConfig || {}),
    };

    if (this.onGetIdTokenAsync) {
      const token = await this.onGetIdTokenAsync();
      result.headers = { Authorization: `Bearer ${token}` };
    }

    return result;
  };
}
