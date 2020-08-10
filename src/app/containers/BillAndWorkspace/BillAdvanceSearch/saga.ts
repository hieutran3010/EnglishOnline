import { call, put, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import { PayloadAction } from '@reduxjs/toolkit';
import BillFetcher from 'app/fetchers/billFetcher';
import Bill from 'app/models/bill';
import { actions } from './slice';

const billFetcher = new BillFetcher();

export function* archiveBillTask(action: PayloadAction<string>) {
  try {
    yield call(billFetcher.archiveBill, action.payload);
    yield call(toast.success, 'Đã hủy Bill!');
    yield put(actions.setNeedToReload(true));
  } catch (error) {
    yield call(toast.error, 'Chưa hủy được bill, vui lòng thử lại!');
  }
}

export function* checkPrintedVatBillTask(action: PayloadAction<Bill>) {
  const selectedBill = action.payload;

  yield call(billFetcher.checkPrintedVatBill, selectedBill.id);
  yield call(toast.success, 'Đã đánh dấu xuất VAT!');
  yield put(actions.setNeedToReload(true));
}

export function* billAdvanceSearchSaga() {
  yield takeLatest(actions.archiveBill.type, archiveBillTask);
  yield takeLatest(actions.checkPrintedVatBill.type, checkPrintedVatBillTask);
}
