import { PayloadAction } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import find from 'lodash/fp/find';
import isEmpty from 'lodash/fp/isEmpty';

import VendorFetcher from 'app/fetchers/vendorFetcher';
import AppParamsFetcher from 'app/fetchers/appParamsFetcher';
import AppParam, { APP_PARAM_KEY, BillParams } from 'app/models/appParam';
import { QuotationReport, QuotationReportParams } from 'app/models/vendor';
import SaleQuotationRate from 'app/models/saleQuotationRate';
import SaleQuotationRateFetcher from 'app/fetchers/saleQuotationRateFetcher';
import { actions } from './slice';
import { selectSaleRates } from './selectors';
import filter from 'lodash/fp/filter';
import { isNil, isUndefined } from 'lodash';
import map from 'lodash/fp/map';

const vendorFetcher = new VendorFetcher();
const appParamFetcher = new AppParamsFetcher();
const saleQuotationRateFetcher = new SaleQuotationRateFetcher();

export function* fetchQuotationReportsTask(
  action: PayloadAction<QuotationReportParams>,
) {
  const queryParams = action.payload;

  let result: QuotationReport[] = [];
  try {
    result = yield call(vendorFetcher.getQuotationReport, queryParams);
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Không tải được báo giá');
  }

  yield put(actions.fetchQuotationReportsCompleted(result));
}

export function* fetchBillParamsTask() {
  const billParams = new BillParams();

  try {
    const appParams = yield call(appParamFetcher.queryManyAsync, {
      query: `Key = "${APP_PARAM_KEY.VAT}" || Key = "${APP_PARAM_KEY.USD_EXCHANGE_RATE}"`,
    });

    if (!isEmpty(appParams)) {
      billParams.vat = (find({ key: APP_PARAM_KEY.VAT })(
        appParams,
      ) as AppParam).value;
      billParams.usdExchangeRate = (find({
        key: APP_PARAM_KEY.USD_EXCHANGE_RATE,
      })(appParams) as AppParam).value;
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchBillParamsCompleted(billParams));
}

export function* fetchSaleQuotationRatesCompleted() {
  let result: SaleQuotationRate[] = [];

  try {
    result = yield call(saleQuotationRateFetcher.queryManyAsync, {
      orderBy: 'fromWeight',
    });
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchSaleQuotationRatesCompleted(result));
}

export function* submitSaleRateTask(
  action: PayloadAction<{ saleRate: SaleQuotationRate; callback?: any }>,
) {
  yield put(actions.setIsSubmittingSaleRate(true));

  let { saleRate, callback } = action.payload;
  const { id } = saleRate;

  try {
    if (id) {
      // update
      saleRate = yield call(saleQuotationRateFetcher.updateAsync, id, saleRate);
    } else {
      saleRate = yield call(saleQuotationRateFetcher.addAsync, saleRate);
    }
    yield put(actions.submitSaleRateCompleted(saleRate));
    callback && callback();
    toast.success('Đã lưu');
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa lưu được');
  }

  yield put(actions.setIsSubmittingSaleRate(false));
}

export function* deleteSaleRateTask(
  action: PayloadAction<{ saleRate: SaleQuotationRate; callback?: any }>,
) {
  const { saleRate, callback } = action.payload;

  let deletedIds: string[] = [];
  try {
    if (isNil(saleRate.toWeight) || isUndefined(saleRate.toWeight)) {
      deletedIds.push(saleRate.id);
    } else {
      const currentSaleRates = (yield select(
        selectSaleRates,
      )) as SaleQuotationRate[];
      const relatedRates = filter(
        (sr: SaleQuotationRate) =>
          !saleRate.toWeight ||
          isNil(sr.toWeight) ||
          isUndefined(sr.toWeight) ||
          sr.toWeight >= saleRate.toWeight,
      )(currentSaleRates);
      deletedIds = map((r: SaleQuotationRate) => r.id)(relatedRates);
    }
    yield call(saleQuotationRateFetcher.deleteBatchAsync, deletedIds);
    callback && callback();
    toast.success('Đã xóa');
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa xóa được');
  }

  yield put(actions.deleteSaleRateCompleted(deletedIds));
}

export function* quickQuotationSaga() {
  yield takeLatest(actions.fetchBillParams.type, fetchBillParamsTask);
  yield takeLatest(
    actions.fetchQuotationReports.type,
    fetchQuotationReportsTask,
  );
  yield takeLatest(
    actions.fetchSaleQuotationRates.type,
    fetchSaleQuotationRatesCompleted,
  );
  yield takeLatest(actions.fetchBillParams.type, fetchBillParamsTask);
  yield takeLatest(actions.submitSaleRate.type, submitSaleRateTask);
  yield takeLatest(actions.deleteSaleRate.type, deleteSaleRateTask);
}
