import { call, put, select, takeLatest } from 'redux-saga/effects';
import * as Sentry from '@sentry/react';

import { PayloadAction } from '@reduxjs/toolkit';
import BillFetcher, { BillPatchExecutor } from 'app/fetchers/billFetcher';

import { actions } from './slice';
import { selectLastChangeData, selectViewableBill } from './selectors';
import { toast } from 'react-toastify';
import Bill from 'app/models/bill';

const billFetcher = new BillFetcher();
const billBatchExecutor = new BillPatchExecutor();

export function* fetchBillDeliveryHistoriesTask(action: PayloadAction<string>) {
  const billId = action.payload;
  const bill = yield call(
    billFetcher.queryOneAsync,
    {
      query: `Id = "${billId}"`,
    },
    ['airlineBillId, childBillId, billDeliveryHistories { date time status }'],
  );

  const { billDeliveryHistories, airlineBillId, childBillId } = bill;
  yield put(
    actions.fetchBillDeliveryHistoriesCompleted({
      airlineBillId,
      childBillId,
      histories: billDeliveryHistories,
    }),
  );
}

export function* saveTask(action: PayloadAction<string>) {
  const billId = action.payload;
  yield put(actions.setIsSaving(true));

  const data = yield select(selectLastChangeData);
  try {
    yield call(billBatchExecutor.updateDeliveryHistory, billId, data);

    yield put(actions.saveCompleted());
    toast.success('Đã lưu!');
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa lưu được, vui lòng thử lại');
  }

  yield put(actions.setIsSaving(false));
}

export function* fetchBillToViewTask(action: PayloadAction<string>) {
  const billId = action.payload;
  const currentViewableBill = yield select(selectViewableBill);

  let bill: Bill | undefined = undefined;
  try {
    if (!currentViewableBill || currentViewableBill.id !== billId) {
      bill = yield call(billFetcher.queryOneAsync, {
        query: `Id = "${billId}"`,
      });
    } else {
      bill = currentViewableBill;
    }
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Không thể tải bill');
  }

  yield put(actions.fetchBillToViewCompleted(bill));
}

export function* billDeliveryHistorySaga() {
  yield takeLatest(
    actions.fetchBillDeliveryHistories.type,
    fetchBillDeliveryHistoriesTask,
  );

  yield takeLatest(actions.save.type, saveTask);
  yield takeLatest(actions.fetchBillToView.type, fetchBillToViewTask);
}
