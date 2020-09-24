import { call, takeLatest, put } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import * as Sentry from '@sentry/react';

import { PayloadAction } from '@reduxjs/toolkit';
import BillFetcher, { BillPatchExecutor } from 'app/fetchers/billFetcher';

import { actions } from './slice';
import { BillViewActionType } from './types';

const billFetcher = new BillFetcher();
const billPatchExecutor = new BillPatchExecutor();

export function* archiveBillTask(action: PayloadAction<BillViewActionType>) {
  yield put(actions.setIsSubmitting(true));

  const billId = action.payload.billId;
  const succeededCallback = action.payload.succeededCallback;

  try {
    const updatedBill = yield call(billPatchExecutor.archiveBill, billId);
    yield call(toast.success, 'Đã hủy bill!');
    succeededCallback && succeededCallback(updatedBill);
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa hủy được bill');
  }

  yield put(actions.setIsSubmitting(false));
}

export function* restoreArchivedBillTask(
  action: PayloadAction<BillViewActionType>,
) {
  yield put(actions.setIsSubmitting(true));

  const billId = action.payload.billId;
  const succeededCallback = action.payload.succeededCallback;

  try {
    const updatedBill = yield call(
      billPatchExecutor.restoreArchivedBill,
      billId,
    );
    yield call(toast.success, 'Đã khôi phục bill từ trạng thái hủy');
    succeededCallback && succeededCallback(updatedBill);
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Chưa khôi phục được bill');
  }

  yield put(actions.setIsSubmitting(false));
}

export function* checkPrintedVatBillTask(
  action: PayloadAction<BillViewActionType>,
) {
  yield put(actions.setIsSubmitting(true));

  const billId = action.payload.billId;
  const succeededCallback = action.payload.succeededCallback;

  try {
    const updatedBill = yield call(
      billPatchExecutor.checkPrintedVatBill,
      billId,
    );
    yield call(toast.success, 'Đã đánh dấu xuất VAT!');
    succeededCallback && succeededCallback(updatedBill);
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Có lỗi xảy ra khi đánh dấu xuất VAT!');
  }

  yield put(actions.setIsSubmitting(false));
}

export function* returnFinalBillToAccountantTask(
  action: PayloadAction<BillViewActionType>,
) {
  yield put(actions.setIsSubmitting(true));

  const billId = action.payload.billId;
  const succeededCallback = action.payload.succeededCallback;

  try {
    const updatedBill = yield call(
      billPatchExecutor.returnFinalBillToAccountant,
      billId,
    );
    yield call(toast.success, 'Đã trả lại bill cho kế toán');
    succeededCallback && succeededCallback(updatedBill);
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Có lỗi xảy ra khi trả lại bill cho kế toán');
  }

  yield put(actions.setIsSubmitting(false));
}

export function* deleteBillTask(action: PayloadAction<BillViewActionType>) {
  yield put(actions.setIsSubmitting(true));

  const billId = action.payload.billId;
  const succeededCallback = action.payload.succeededCallback;

  try {
    yield call(billFetcher.deleteAsync, billId);
    yield call(toast.success, 'Đã xóa bill');
    succeededCallback && succeededCallback(billId);
  } catch (error) {
    Sentry.captureException(error);
    toast.error('Có lỗi xảy ra khi xóa bill');
  }

  yield put(actions.setIsSubmitting(false));
}

export function* billViewPageSaga() {
  yield takeLatest(actions.archiveBill.type, archiveBillTask);
  yield takeLatest(actions.checkPrintedVatBill.type, checkPrintedVatBillTask);
  yield takeLatest(
    actions.returnFinalBillToAccountant.type,
    returnFinalBillToAccountantTask,
  );
  yield takeLatest(actions.restoreArchivedBill.type, restoreArchivedBillTask);
  yield takeLatest(actions.forceDeleteBill.type, deleteBillTask);
}
