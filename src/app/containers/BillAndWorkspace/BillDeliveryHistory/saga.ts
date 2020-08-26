import { call, put, select, takeLatest } from 'redux-saga/effects';
import * as Sentry from '@sentry/react';

import { PayloadAction } from '@reduxjs/toolkit';
import BillFetcher, { BillPatchExecutor } from 'app/fetchers/billFetcher';

import { actions } from './slice';
import { selectHistories } from './selectors';
import { toast } from 'react-toastify';

const billFetcher = new BillFetcher();
const billBatchExecutor = new BillPatchExecutor();

export function* fetchBillDeliveryHistoriesTask(action: PayloadAction<string>) {
  const billId = action.payload;
  const bill = yield call(
    billFetcher.queryOneAsync,
    {
      query: `Id = "${billId}"`,
    },
    ['billDeliveryHistories { date time status }'],
  );

  const { billDeliveryHistories } = bill;
  yield put(actions.fetchBillDeliveryHistoriesCompleted(billDeliveryHistories));
}

export function* saveTask(action: PayloadAction<string>) {
  const billId = action.payload;
  yield put(actions.setIsSaving(true));

  const data = yield select(selectHistories);
  try {
    yield call(billBatchExecutor.updateDeliveryHistory, billId, data);
    yield put(actions.setIsSaving(false));
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa lưu được, vui lòng thử lại');
  }

  yield put(actions.setIsSaving(false));
}

export function* billDeliveryHistorySaga() {
  yield takeLatest(
    actions.fetchBillDeliveryHistories.type,
    fetchBillDeliveryHistoriesTask,
  );

  yield takeLatest(actions.save.type, saveTask);
}
