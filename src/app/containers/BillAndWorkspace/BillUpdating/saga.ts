import * as Sentry from '@sentry/react';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { actions } from './slice';
import Bill from 'app/models/bill';
import BillFetcher from 'app/fetchers/billFetcher';

const billFetcher = new BillFetcher();

export function* fetchBillTask(action: PayloadAction<string>) {
  const billId = action.payload;

  let bill: Bill | undefined = undefined;
  try {
    bill = yield call(billFetcher.queryOneAsync, { query: `Id = "${billId}"` });
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchBillCompleted(bill));
}

export function* billUpdatingSaga() {
  yield takeLatest(actions.fetchBill.type, fetchBillTask);
}
