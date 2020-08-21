import { call, put, takeLatest } from 'redux-saga/effects';
import BillFetcher from 'app/fetchers/billFetcher';
import Bill, { BILL_STATUS } from 'app/models/bill';
import { actions } from './slice';
import { actions as billCreateOrUpdateActions } from '../BillCreateOrUpdate/slice';
import { PayloadAction } from '@reduxjs/toolkit';

const billFetcher = new BillFetcher();

export function* fetchNumberOfUncheckedVatBillTask() {
  try {
    const result = yield call(
      billFetcher.countAsync,
      `IsArchived = false and Status = "${BILL_STATUS.DONE}" and Vat > 0 and IsPrintedVatBill = false`,
    );
    yield put(actions.fetchNumberOfUncheckedVatBillCompleted(result));
  } catch (error) {
    // TODO: should log here
  }
}

export function* setNeedToRefreshBillListTask() {
  yield put(actions.setNeedToReloadWorkingBills(true));
}

export function* assignLicenseOrAccountantCompletedTask(
  action: PayloadAction<Bill>,
) {
  yield call(setNeedToRefreshBillListTask);
  yield put(actions.selectBill(action.payload));
}

export function* workspaceSaga() {
  yield takeLatest(
    actions.fetchNumberOfUncheckedVatBill.type,
    fetchNumberOfUncheckedVatBillTask,
  );
  yield takeLatest(
    billCreateOrUpdateActions.submitBillCompleted,
    setNeedToRefreshBillListTask,
  );
  yield takeLatest(
    billCreateOrUpdateActions.finalBillCompleted,
    setNeedToRefreshBillListTask,
  );
  yield takeLatest(
    billCreateOrUpdateActions.assignLicenseCompleted,
    assignLicenseOrAccountantCompletedTask,
  );
  yield takeLatest(
    billCreateOrUpdateActions.deleteBillCompleted,
    setNeedToRefreshBillListTask,
  );
  yield takeLatest(
    billCreateOrUpdateActions.assignToAccountantCompleted,
    assignLicenseOrAccountantCompletedTask,
  );
}
