import AppParam, { APP_PARAM_KEY } from 'app/models/appParam';
import find from 'lodash/fp/find';
import findIndex from 'lodash/fp/findIndex';

const getAppParam = (key: APP_PARAM_KEY, params: AppParam[]): AppParam => {
  return find((param: AppParam) => param.key === key)(params) || new AppParam();
};

const getAppParamIndex = (key: APP_PARAM_KEY, params: AppParam[]): number => {
  return findIndex((param: AppParam) => param.key === key)(params);
};

export { getAppParam, getAppParamIndex };
