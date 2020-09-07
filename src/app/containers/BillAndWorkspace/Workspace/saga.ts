import { call, put, takeLatest, select } from 'redux-saga/effects';
import moment from 'moment';
import * as Sentry from '@sentry/react';

import BillFetcher from 'app/fetchers/billFetcher';
import Bill, { BILL_STATUS } from 'app/models/bill';
import { actions } from './slice';
import { actions as billCreateOrUpdateActions } from '../BillCreateOrUpdate/slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import { selectSelectedMonth } from '../BillsInMonth/selectors';
import { toFullString } from 'utils/numberFormat';
import { selectPage, selectPageSize } from './selectors';

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

export function* fetchMyBillsTask(action: PayloadAction<number>) {
  const selectedMonth = action.payload;
  const query = yield call(getMyBillsQuery, selectedMonth);
  const currentPage = yield select(selectPage);
  const pageSize = yield select(selectPageSize);

  try {
    const newPage = currentPage + 1;
    const result = yield call(billFetcher.queryManyAsync, {
      query,
      page: newPage,
      pageSize: pageSize,
      orderBy: 'Date desc',
    });
    yield put(actions.fetchMyBillsCompleted({ bills: result, newPage }));
  } catch (error) {
    Sentry.captureException(error);
    yield put(
      actions.fetchMyBillsCompleted({ bills: [], newPage: currentPage }),
    );
  }
}

export function* assignLicenseOrAccountantCompletedTask(
  action: PayloadAction<Bill>,
) {
  yield call(setNeedToRefreshBillListTask);
  yield put(actions.selectBill(action.payload));
}

export function* onFinalBillTask() {
  yield call(setNeedToRefreshBillListTask);
  yield put(actions.selectBill(new Bill()));
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
    onFinalBillTask,
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
  yield takeLatest(actions.fetchMyBills, fetchMyBillsTask);
}

function getMyBillsQuery(selectedMonth) {
  const user = authStorage.getUser();
  let query = `Period  = "${toFullString(selectedMonth)}-${moment().format(
    'YYYY',
  )}"`;

  switch (user.role) {
    case Role.LICENSE: {
      return `${query} and LicenseUserId = "${user.id}"`;
    }
    case Role.ACCOUNTANT: {
      return `${query} and AccountantUserId = "${user.id}"`;
    }
    case Role.SALE: {
      return `${query} and SaleUserId = "${user.id}"`;
    }
    default: {
      return ``;
    }
  }
}
