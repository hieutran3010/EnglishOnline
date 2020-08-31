import { call, put, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import { PayloadAction } from '@reduxjs/toolkit';
import BillFetcher, { BillPatchExecutor } from 'app/fetchers/billFetcher';

import { actions } from './slice';
import Bill from 'app/models/bill';

const billFetcher = new BillFetcher();
const billPatchExecutor = new BillPatchExecutor();

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

export function* returnFinalBillToAccountantTask(
  action: PayloadAction<string>,
) {
  const billId = action.payload;

  yield call(billPatchExecutor.restoreFinalBill, billId);
  yield call(toast.success, 'Đã trả lại bill cho kế toán');
  yield put(actions.setNeedToReload(true));
}

export function* restoreArchivedBillTask(action: PayloadAction<string>) {
  const billId = action.payload;

  yield call(billPatchExecutor.restoreArchivedBill, billId);
  yield call(toast.success, 'Đã khôi phục bill từ trạng thái hủy');
  yield put(actions.setNeedToReload(true));
}

export function* deleteBillTask(action: PayloadAction<string>) {
  const billId = action.payload;

  yield call(billFetcher.deleteAsync, billId);
  yield call(toast.success, 'Đã xóa bill');
  yield put(actions.setNeedToReload(true));
}

export function* billsInMonthSaga() {
  yield takeLatest(actions.archivedBill.type, archivedBillTask);
  yield takeLatest(actions.checkPrintedVatBill.type, checkPrintedVatBillTask);
  yield takeLatest(
    actions.returnFinalBillToAccountant.type,
    returnFinalBillToAccountantTask,
  );
  yield takeLatest(actions.restoreArchivedBill.type, restoreArchivedBillTask);
  yield takeLatest(actions.forceDeleteBill.type, deleteBillTask);
}
