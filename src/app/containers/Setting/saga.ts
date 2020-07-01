import { call, put, takeLatest, select } from 'redux-saga/effects';
import { actions } from './slice';
import AppParamsFetcher from 'app/fetchers/appParamsFetcher';
import { PayloadAction } from '@reduxjs/toolkit';
import AppParam, { BillParams, APP_PARAM_KEY } from 'app/models/appParam';
import { selectAppParams } from './selectors';
import { getAppParam } from './utils';
import { toast } from 'react-toastify';
import isEmpty from 'lodash/fp/isEmpty';
import toString from 'lodash/fp/toString';

const appParamsFetcher = new AppParamsFetcher();

export function* fetchAppParamsTask() {
  const appParams = yield call(appParamsFetcher.queryManyAsync, {});
  yield put(actions.fetchAppParamsCompleted(appParams));
}

export function* updateBillParamsTask(action: PayloadAction<BillParams>) {
  const result: AppParam[] = [];
  try {
    const { vat, usdExchangeRate } = action.payload;
    const appParams = (yield select(selectAppParams)) as AppParam[];

    const updatedVatParam = yield call(
      createOrUpdateAppParam,
      APP_PARAM_KEY.VAT,
      appParams,
      vat,
    );

    const updatedUsdExchangeRateParam = yield call(
      createOrUpdateAppParam,
      APP_PARAM_KEY.USD_EXCHANGE_RATE,
      appParams,
      usdExchangeRate,
    );

    result.push(updatedVatParam);
    result.push(updatedUsdExchangeRateParam);

    yield call(toast.success, 'Đã lưu!');
  } catch (error) {
    yield call(toast.error, 'Chưa lưu được, vui lòng thử lại!');
  }

  yield put(actions.updateBillParamsCompleted(result));
}

const createOrUpdateAppParam = (
  key: APP_PARAM_KEY,
  appParams: AppParam[],
  newValue: any,
) => {
  let appParam = { ...getAppParam(key, appParams) };
  if (isEmpty(appParam.id)) {
    appParam = new AppParam();
    appParam.key = key;
    appParam.value = toString(newValue);

    return appParamsFetcher.addAsync(appParam);
  } else {
    appParam.value = toString(newValue);

    return appParamsFetcher.updateAsync(appParam.id, appParam);
  }
};

export function* settingSaga() {
  yield takeLatest(actions.fetchAppParams.type, fetchAppParamsTask);
  yield takeLatest(actions.updateBillParams.type, updateBillParamsTask);
}
