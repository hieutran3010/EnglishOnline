import * as Sentry from '@sentry/react';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import moment from 'moment';

import BillFetcher from 'app/fetchers/billFetcher';
import Bill, { BILL_STATUS } from 'app/models/bill';
import { actions } from './slice';
import { actions as billCreateOrUpdateActions } from '../BillCreateOrUpdate/slice';
import { actions as billDeliveryHistoryActions } from '../BillDeliveryHistory/slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { authStorage } from 'app/services/auth';
import { Role } from 'app/models/user';
import { toFullString } from 'utils/numberFormat';
import {
  selectMyBills,
  selectMyBillsCurrentPage,
  selectMyBillsPageSize,
  selectSearchKey,
  selectSelectedMonth,
} from './selectors';
import { size, toLower } from 'lodash';
import isEmpty from 'lodash/fp/isEmpty';
import { BillDeliveryHistoriesUpdatedEventArgs } from '../BillDeliveryHistory/types';
import { BILL_LIST_DEFAULT_ORDER } from '../constants';

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

export function* fetchMyBillsTask(action: PayloadAction<boolean>) {
  const isForceFetching = action.payload;
  const currentData = yield select(selectMyBills);
  if (isForceFetching || size(currentData) <= 0) {
    let totalItems = 0;
    let bills = [];

    try {
      const query = yield call(getMyBillsQuery);
      totalItems = yield call(billFetcher.countAsync, query);

      if (totalItems > 0) {
        bills = yield call(fetchBills, query, 1);
      }
    } catch (error) {
      Sentry.captureException(error);
    }

    yield put(actions.fetchMyBillsCompleted({ bills, totalItems }));
  }
}

export function* fetchMoreMyBillsTask() {
  let page = yield select(selectMyBillsCurrentPage);
  let bills: Bill[] = [];

  try {
    const query = yield call(getMyBillsQuery);
    let newPage = page + 1;
    bills = yield call(fetchBills, query, newPage);
    page = newPage;
  } catch (error) {
    Sentry.captureException(error);
  }

  yield put(actions.fetchMoreMyBillsCompleted({ bills, page }));
}

export function* filterChangedTask() {
  yield put(actions.fetchMyBills(true));
}

export function* onUpdateMyBill(action: PayloadAction<Bill>) {
  yield put(actions.updateMyBill({ bill: action.payload, isNew: false }));
}

export function* onBillDeletedTask(action: PayloadAction<string>) {
  yield put(actions.deleteMyBill(action.payload));
}

export function* onBillSubmitted(
  action: PayloadAction<{ bill: Bill; isNew?: boolean }>,
) {
  yield put(actions.updateMyBill(action.payload));
}

export function* onUpdateBillDeliveryHistories(
  action: PayloadAction<BillDeliveryHistoriesUpdatedEventArgs>,
) {
  yield put(actions.updateBillDeliveryHistories(action.payload));
}

export function* fetchTotalMyBillsCreatedTodayTask() {
  try {
    const currentUser = authStorage.getUser();
    const { displayName } = currentUser;
    const total = yield call(
      billFetcher.countAsync,
      `
    CreatedBy = "${displayName}" and Date = "${moment().format('YYYY-MM-DD')}"
    `,
    );
    yield put(actions.fetchTotalMyBillsCreatedTodayCompleted(total));
  } catch (error) {
    Sentry.captureException(error);
  }
}

export function* workspaceSaga() {
  yield takeLatest(
    actions.fetchNumberOfUncheckedVatBill.type,
    fetchNumberOfUncheckedVatBillTask,
  );
  yield takeLatest(actions.fetchMyBills.type, fetchMyBillsTask);
  yield takeLatest(actions.changeMonth.type, filterChangedTask);
  yield takeLatest(actions.search.type, filterChangedTask);
  yield takeLatest(actions.fetchMoreMyBills.type, fetchMoreMyBillsTask);
  yield takeLatest(
    actions.fetchTotalMyBillsCreatedToday.type,
    fetchTotalMyBillsCreatedTodayTask,
  );

  yield takeLatest(
    billCreateOrUpdateActions.submitBillCompleted,
    onBillSubmitted,
  );
  yield takeLatest(
    billCreateOrUpdateActions.finalBillCompleted,
    onUpdateMyBill,
  );
  yield takeLatest(
    billCreateOrUpdateActions.assignLicenseCompleted,
    onUpdateMyBill,
  );
  yield takeLatest(
    billCreateOrUpdateActions.assignToAccountantCompleted,
    onUpdateMyBill,
  );
  yield takeLatest(
    billCreateOrUpdateActions.deleteBillCompleted,
    onBillDeletedTask,
  );
  yield takeLatest(
    billDeliveryHistoryActions.saveCompleted,
    onUpdateBillDeliveryHistories,
  );
}

function* getMyBillsQuery() {
  const user = authStorage.getUser();

  const selectedMonth = yield select(selectSelectedMonth);

  let query = `Period  = "${toFullString(selectedMonth)}-${moment().format(
    'YYYY',
  )}" and IsArchived = false`;

  const searchKey = yield select(selectSearchKey);
  if (!isEmpty(searchKey)) {
    const lowerSearchKey = toLower(searchKey);
    query = `${query} 
    and (AirlineBillId.ToLower().Contains("${lowerSearchKey}") 
          or ChildBillId.ToLower().Contains("${lowerSearchKey}") 
          or SenderName.ToLower().Contains("${lowerSearchKey}")
          or SenderNameNonUnicode.ToLower().Contains("${lowerSearchKey}")
          or SenderPhone.Contains("${lowerSearchKey}")
          or ReceiverName.ToLower().Contains("${lowerSearchKey}")
          or ReceiverNameNonUnicode.ToLower().Contains("${lowerSearchKey}"))`;
  }

  if (user.role === Role.SALE) {
    query = `${query} and saleUserId = "${user.id}"`;
  } else if (user.role === Role.LICENSE) {
    query = `${query} and licenseUserId = "${user.id}"`;
  } else if (user.role === Role.ACCOUNTANT) {
    query = `${query} and (accountantUserId = "${user.id}" or Status = "${BILL_STATUS.ACCOUNTANT}")`;
  }

  return query;
}

function* fetchBills(query: string, page: number) {
  const pageSize = yield select(selectMyBillsPageSize);

  const bills = yield call(billFetcher.queryManyAsync, {
    query,
    orderBy: BILL_LIST_DEFAULT_ORDER,
    page,
    pageSize,
  });

  return bills;
}
