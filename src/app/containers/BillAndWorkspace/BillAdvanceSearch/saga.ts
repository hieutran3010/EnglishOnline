import { call, put, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import { PayloadAction } from '@reduxjs/toolkit';
import BillFetcher, { BillPatchExecutor } from 'app/fetchers/billFetcher';
import Bill from 'app/models/bill';
import { actions } from './slice';

const billFetcher = new BillFetcher();
const billPatchExecutor = new BillPatchExecutor();

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

export function* forceDeleteBillTask(action: PayloadAction<string>) {
  const billId = action.payload;

  yield call(billFetcher.deleteAsync, billId);
  yield call(toast.success, 'Đã xóa bill');
  yield put(actions.setNeedToReload(true));
}

export function* billAdvanceSearchSaga() {
  yield takeLatest(actions.archiveBill.type, archiveBillTask);
  yield takeLatest(actions.checkPrintedVatBill.type, checkPrintedVatBillTask);
  yield takeLatest(
    actions.returnFinalBillToAccountant.type,
    returnFinalBillToAccountantTask,
  );
  yield takeLatest(actions.restoreArchivedBill.type, restoreArchivedBillTask);
  yield takeLatest(actions.forceDeleteBill.type, forceDeleteBillTask);
}
