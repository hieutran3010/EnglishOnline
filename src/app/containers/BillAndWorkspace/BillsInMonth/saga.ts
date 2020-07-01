import { call, put, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import { PayloadAction } from '@reduxjs/toolkit';
import BillFetcher from 'app/fetchers/billFetcher';

import { actions } from './slice';
import Bill from 'app/models/bill';

const billFetcher = new BillFetcher();

export function* archivedBillTask(action: PayloadAction<string>) {
  const billId = action.payload;

  yield call(billFetcher.archiveBill, billId);
  yield call(toast.success, 'Đã hủy Bill!');
  yield put(actions.setNeedToReload(true));
}

export function* checkPrintedVatBillTask(action: PayloadAction<Bill>) {
  const selectedBill = action.payload;

  yield call(billFetcher.checkPrintedVatBill, selectedBill.id);
  yield call(toast.success, 'Đã đánh dấu xuất VAT!');
  yield put(actions.setNeedToReload(true));
}

export function* billsInMonthSaga() {
  yield takeLatest(actions.archivedBill.type, archivedBillTask);
  yield takeLatest(actions.checkPrintedVatBill.type, checkPrintedVatBillTask);
}
